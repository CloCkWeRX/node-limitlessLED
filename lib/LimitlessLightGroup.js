/* LimitlessLED Driver for Ninja Blocks
 * 
 * LimitlessLightGroup - Converts light protocol messages to UDP packets that
 *  the "WiFi Receiver Bridge" supports.
 *
 * References:
 *   http://www.limitlessled.com/dev/
 */

var stream = require('stream')
  , util = require('util')
  , dgram = require('dgram');

// Give our module a stream interface
util.inherits(LimitlessLightGroup, stream);

// Export it
module.exports=LimitlessLightGroup;


const cmdModePrevByte = 0x28;
const cmdModeNextByte = 0x27;
const cmdOffByte = 0x21;
const cmdOnByte = 0x22;
const cmdColourByte = 0x20;
const cmdColourByteRGBW = 0x40;
const valByteNA = 0x00;
const cmdEndByte = 0x55;

var whiteLightGroupCommands = {
  "all": { "on": 0x35, "off": 0x39 },
  "1": { "on": 0x38, "off": 0x3B },
  "2": { "on": 0x3D, "off": 0x33 },
  "3": { "on": 0x37, "off": 0x3A },
  "4": { "on": 0x32, "off": 0x36 },
};

var rgbwLightGroupCommands = {
  "all":  { "on": 0x42, "off": 0x41, "toWhite": 0xC2 },
  "1":    { "on": 0x45, "off": 0x46, "toWhite": 0xC5 },
  "2":    { "on": 0x47, "off": 0x48, "toWhite": 0xC7 },
  "3":    { "on": 0x49, "off": 0x4A, "toWhite": 0xC9 },
  "4":    { "on": 0x4B, "off": 0x4C, "toWhite": 0xCB },
};

/**
 * Creates a new Device Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Number} G - the channel of this device
 * @property {Number} V - the vendor ID of this device
 * @property {Number} D - the device ID of this device
 *
 * @property {Function} write Called when data is received from the cloud
 *
 * @fires data - Emit this when you wish to send data to the cloud
 */
//TODO: seperate specific data to be passed in on instantiation
function LimitlessLightGroup(hub, lightGroup) {

  var self = this;
  
  this.lightGroup = lightGroup;
  //console.log( 'Setting up limitless group:', lightGroup );

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.voodooLock = false;
  this.lastBrightness = null;
  this.lastWarmth = null;
  this.lastWasRGB = null;

  this.name = 'LimitlessLED - Group ' + lightGroup.number + ' (' + lightGroup.colorType + ')';
  this.G = lightGroup.number + lightGroup.colorType + hub.identifier; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  var typeToId = {
    rgb: 1011,    // LimitlessLED RGB device id
    white: 1012,  // LimitlessLED White device id
    rgbw: 1013    // LimitlessLED RGB+@ device id
  };
  this.D = typeToId[lightGroup.colorType] || typeToId.white;

  this.hub = hub;

  /*process.nextTick(function() {
    self.emit('data','0000FF');
  });*/
};

const BLACK = '000000';
const BLUE = '0000FF';
const GREEN = '00FF00';
const CYAN = '00FFFF';
const RED = 'FF0000';
const MAGENTA = 'FF00FF';
const YELLOW = 'FFFF00';
const WHITE = 'FFFFFF';

const LLL_BLUE = 0x10;
const LLL_GREEN = 0x60;
const LLL_CYAN = 0x40;
const LLL_RED = 0xB0;
const LLL_MAGENTA = 0xD0;
const LLL_YELLOW = 0x80;

var colours = [BLUE, GREEN, CYAN, RED, MAGENTA, YELLOW];
var lllColourLookup = [LLL_BLUE, LLL_GREEN, LLL_CYAN, LLL_RED, LLL_MAGENTA, LLL_YELLOW];

/**
 * Called whenever there is data from the cloud
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
LimitlessLightGroup.prototype.write = function(data) {
  var self = this;

  // I'm being actuated with data!
  //console.log('LimitlessLED setting colour ', data);
  //console.log('LimitlessLED options ', this.lightGroup);
  
  if ( data[0] == '{' ) {
    // json, ie light protocol
    var parsed = JSON.parse( data );
    var brightness = parsed.bri / 254.0;
    var on = parsed.on;
    var temp = parsed.ct;
    
    if ( this.lightGroup.colorType == 'rgbw' ) {
      // new RGB+W LEDs
      self.writeRGBW( parsed );
    } else if ( this.lightGroup.colorType == 'rgb' ) {
      var cb = function() {
        self.doBrightnessVoodoo( brightness );
      };
      if ( on ) {
        cb = function() {
          if ( parsed.sat === 0 ) {
            // white
            self.sendRGBWhiteColorCommand( function() {
              self.doBrightnessVoodoo( brightness );
            } );
          } else {
            // colour
            var brokenHue = 255 - parseInt(parsed.hue / 0xff);
            var resetRed = (brokenHue + 0xb0);
            self.sendRGBColorCommand( resetRed % 0xff, function() {
              self.doBrightnessVoodoo( brightness );
            } );
          }
        };
      }
      self.sendRGBLEDOnCommand( on, cb );
    } else {
      if ( on ) {
        var self = this;
        
        // FIXME: add support for temperature
        
        self.sendWhiteGroupCommand( 'on', function() {
          self.doBrightnessVoodoo( brightness, function() {
            // now do the temperature change
            self.doWarmthVoodoo( (temp - 154.0) / (500.0 - 154.0) );
          } );
        } );
      } else {
        this.sendWhiteGroupCommand( 'off' );
      }
    }
    
    self.emit('data', data);
  } else {
    // fall back to icky old code
    if (this.lightGroup.colorType == 'white') {
      if (data == BLACK) {
        console.log( 'Off' );
        this.sendWhiteGroupCommand( 'off' );
      } else {
        console.log( 'On' );
        this.sendWhiteGroupCommand( 'on' );
      }
      self.emit('data', data);
      return;
    }
  
    var functionToCall;
    var turnOnFirst = false;
    if (data == BLACK) {
      functionToCall = function () {
        setRGBLED(0, this.hub.connectionDetails);
      }.bind(this);
    }
    else if (data == WHITE) {
      functionToCall = function () {
        setRGBMode(MODEPREV, this.hub.connectionDetails;
      }.bind(this);
      turnOnFirst = true;
    }
    else { //may be a colour
      var colourIndex = colours.indexOf(data);
      if (colourIndex != -1) { //is a colour
        functionToCall = function() {
          setRGBColour(lllColourLookup[colourIndex], this.hub.connectionDetails);
        }.bind(this);
      turnOnFirst = true;
      }
    }
    if (typeof functionToCall !== 'undefined') {
      if (turnOnFirst) {
        setRGBLED(1, this.hub.connectionDetails,  functionToCall);
      }
      else {
        functionToCall();
      }
      self.emit('data', data);
    }
  }
};

LimitlessLightGroup.prototype.writeRGBW = function( data ) {
  //console.log( data );

  var bri = data.bri / 254.0;
  var translated = bri * 0x3B; // manual says "Byte2: 0×00 to 0xFF (full brightness 0x3B)"

  if ( data.on ) {
    var self = this;

    // manual says to always start with the 'on' command to identify the group
    self.sendRGBWGroupCommand( 'on', function() {
      var doBrightness = function() {
        self.sendRGBWGroupCommand( 'on', function() {
          self.sendDirectBrightnessCommand( bri, function() {} );
        } );
      };

      var whiteMode = ( data.sat === 0 ); // if a color temp is specified, say we're white

      if ( whiteMode ) {
        // followed by a setting to put it to white mode
        self.sendRGBWGroupCommand( 'toWhite', doBrightness );
      } else {
        // rgb mode
        var brokenHue = 255 - parseInt(data.hue / 0xff);
        var resetRed = (brokenHue + 0xb0);
        self.sendRGBColorCommand( resetRed % 0xff, doBrightness );
      }
    } );
  } else {
    this.sendRGBWGroupCommand( 'off' );
  }
};

LimitlessLightGroup.prototype.doWarmthVoodoo = function( warmth, completion ) {
  // sorry for copy paste :(
    
  if ( this.lastWarmth == warmth ) {
    if (completion) completion( );
    return;
  }
  
  this.lastWarmth = warmth;
  
  if ( this.voodooLock ) {
    if (completion) completion( );
    return;
  }
  
  this.voodooLock = true;
  
  var self = this;
  var warmthScaled = parseInt(warmth * 10);

  if ( warmthScaled > 5 ) {
    // up ...
    self.repeatCommand( function( callback ) {
      self.sendWarmthUpCommand( callback );
    }, 10, function() {
      // and down
      self.repeatCommand( function( callback ) {
        self.sendWarmthDownCommand( callback );
      }, 10 - warmthScaled, function() {
        //console.log( "DONE" );
        self.voodooLock = false;
        if (completion) completion( );
      } );
    } );
  } else {
    // down ...
    self.repeatCommand( function( callback ) {
      self.sendWarmthDownCommand( callback );
    }, 10, function() {
      // and up
      self.repeatCommand( function( callback ) {
        self.sendWarmthUpCommand( callback );
      }, warmthScaled, function() {
        //console.log( "DONE" );
        self.voodooLock = false;
        if (completion) completion( );
      } );
    } );
  }
};

LimitlessLightGroup.prototype.doBrightnessVoodoo = function( brightness, completion ) {
  if ( this.lastBrightness == brightness ) {
    if (completion) completion( );
    return;
  }
  
  this.lastBrightness = brightness;
  
  if ( this.voodooLock ) {
    if (completion) completion( );
    return;
  }
  
  this.voodooLock = true;
  
  var self = this;
  var brightnessScaled = parseInt(brightness * 10);

  if ( brightnessScaled > 5 ) {
    // up ...
    self.repeatCommand( function( callback ) {
      self.sendBrightnessUpCommand( callback );
    }, 10, function() {
      // and down
      self.repeatCommand( function( callback ) {
        self.sendBrightnessDownCommand( callback );
      }, 10 - brightnessScaled, function() {
        //console.log( "DONE" );
        self.voodooLock = false;
        if (completion) completion( );
      } );
    } );
  } else {
    // down ...
    self.repeatCommand( function( callback ) {
      self.sendBrightnessDownCommand( callback );
    }, 10, function() {
      // and up
      self.repeatCommand( function( callback ) {
        self.sendBrightnessUpCommand( callback );
      }, brightnessScaled, function() {
        //console.log( "DONE" );
        self.voodooLock = false;
        if (completion) completion( );
      } );
    } );
  }
};

LimitlessLightGroup.prototype.sendDirectBrightnessCommand = function( brightness, callback ) {
  if ( !this.lastWasRGB ) {
    this.lastBrightness = null; // reset brightness due to mode change
  }
  this.lastWasRGB = true;
  
  var cmd = 0x4E;

  // documentation says 0x3B is full brightness
  // but during testing, values over 32 acted strangely (36 was back to dim)
  var mapped = parseInt(brightness * 32);

  sendUDPCommand(cmd, mapped, this.hub.connectionDetails, callback);
};


LimitlessLightGroup.prototype.sendRGBColorCommand = function( hueVal, callback ) {
  if ( !this.lastWasRGB ) {
    this.lastBrightness = null; // reset brightness due to mode change
  }
  this.lastWasRGB = true;
  
  //console.log( 'Hue value:', hueVal );

  var cmd = cmdColourByte;

  if ( this.lightGroup.colorType == 'rgbw' ) {
    cmd = cmdColourByteRGBW;
  }

  sendUDPCommand(cmd, hueVal, this.hub.connectionDetails, callback);
};

LimitlessLightGroup.prototype.sendRGBWhiteColorCommand = function( callback ) {
  var self = this;
  if ( this.lastWasRGB ) {
    this.lastBrightness = null; // reset brightness due to mode change
  }
  this.lastWasRGB = false;
  
  // the highest mode is "20" so we need to "mode down" 20 times to guarentee we get to white (UGH!)
  
  self.repeatCommand( function( callback ) {
    sendUDPCommand(cmdModePrevByte, 0, self.hub.connectionDetails, callback, 50);
  }, 20, callback );
};

LimitlessLightGroup.prototype.repeatCommand = function( toRepeat, times, completion ) {
  if ( times > 0 ) {
    var remaining = times;
  
    var doNext = function( ) {
      //console.log( 'remaining', remaining );
      remaining -= 1;
    
      if ( remaining < 0 ) {
        completion( );
      } else {
        toRepeat( doNext );
      }
    };
  
    //console.log( 'GO!' );
    doNext( );
  } else {
    completion( );
  }
};

LimitlessLightGroup.prototype.sendBrightnessUpCommand = function(callback) {
  var cmdByte = this.lightGroup.colorType == 'rgb' ? 0x23 : 0x3C;
  sendUDPCommand(cmdByte, valByteNA, this.hub.connectionDetails, callback);
};

LimitlessLightGroup.prototype.sendBrightnessDownCommand = function(callback) {
  var cmdByte = this.lightGroup.colorType == 'rgb' ? 0x24 : 0x34;
  sendUDPCommand(cmdByte, valByteNA, this.hub.connectionDetails, callback);
};

LimitlessLightGroup.prototype.sendWarmthUpCommand = function(callback) {
  var cmdByte = 0x3E;
  sendUDPCommand(cmdByte, valByteNA, this.hub.connectionDetails, callback);
};

LimitlessLightGroup.prototype.sendWarmthDownCommand = function(callback) {
  var cmdByte = 0x3F;
  sendUDPCommand(cmdByte, valByteNA, this.hub.connectionDetails, callback);
};

LimitlessLightGroup.prototype.sendWhiteGroupCommand = function(cmd, callback) {
  var cmdByte = whiteLightGroupCommands[this.lightGroup.number][cmd];
  sendUDPCommand(cmdByte, valByteNA, this.hub.connectionDetails, callback);
};

LimitlessLightGroup.prototype.sendRGBWGroupCommand = function(cmd, callback) {
  var cmdByte = rgbwLightGroupCommands[this.lightGroup.number][cmd];
  sendUDPCommand(cmdByte, valByteNA, this.hub.connectionDetails, callback);
};

LimitlessLightGroup.prototype.sendRGBLEDOnCommand = function(on, callback) {
  var cmdByte = (on ? cmdOnByte : cmdOffByte);
  sendUDPCommand(cmdByte, valByteNA, this.hub.connectionDetails, callback);
};

function setRGBLED(on, connectionDetails, callback) {
  var cmdByte = (on ? cmdOnByte : cmdOffByte);
  sendUDPCommand(cmdByte, valByteNA, connectionDetails, callback);
}

const MODENEXT = true;
const MODEPREV = false;
function setRGBMode(nextMode, connectionDetails) {
  var cmdByte = (nextMode ? cmdModeNextByte : cmdModePrevByte);
  sendUDPCommand(cmdByte, valByteNA, connectionDetails);
}

function setRGBColour(valueByte, connectionDetails) {
  sendUDPCommand(cmdColourByte, valueByte, connectionDetails);
}

function sendUDPCommand(cmdByte, valByte, connectionDetails, callback, timeout) {
  //console.log( connectionDetails );
  var didFinishSend = function (err, bytes) {
    client.close();
    if (typeof callback !== 'undefined') {
      setTimeout(callback, timeout || 100);
    }
  }
  var cmd = new Buffer([cmdByte, valByte, cmdEndByte]);
  var client = dgram.createSocket('udp4');
  //console.log(cmd, parseInt(connectionDetails.port), connectionDetails.ipAddress);
  client.send(cmd, 0, cmd.length, parseInt(connectionDetails.port), connectionDetails.ipAddress, didFinishSend)
}

