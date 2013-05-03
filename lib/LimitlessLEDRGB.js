var stream = require('stream')
  , util = require('util')
  , dgram = require('dgram');

// Give our module a stream interface
util.inherits(LimitlessLEDRGB, stream);

// Export it
module.exports=LimitlessLEDRGB;

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
function LimitlessLEDRGB() {

  var self = this;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.G = "0"; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 1000; // 2000 is a generic Ninja Blocks sandbox device

  this.ipAddress = "192.168.1.100";
  this.port = "50000";

  process.nextTick(function() {
    self.emit('data','0000FF');
  });
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

LimitlessLEDRGB.prototype.setIpPort = function(ipAddress, port) {
  this.ipAddress = ipAddress;
  this.port = port;
}

/**
 * Called whenever there is data from the cloud
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
LimitlessLEDRGB.prototype.write = function(data) {
  var self = this;

  // I'm being actuated with data!
  console.log(data);
  var functionToCall;
  var turnOnFirst = false;
  if (data == BLACK) {
    functionToCall = function () {
      setRGBLED(0, this.ipAddress, this.port);
    }.bind(this);
  }
  else if (data == WHITE) {
    functionToCall = function () {
      setRGBMode(MODEPREV, this.ipAddress, this.port);
    }.bind(this);
    turnOnFirst = true;
  }
  else { //may be a colour
    var colourIndex = colours.indexOf(data);
    if (colourIndex != -1) { //is a colour
      functionToCall = function() {
        setRGBColour(lllColourLookup[colourIndex], this.ipAddress, this.port);
      }.bind(this);
    turnOnFirst = true;
    }
  }
  if (typeof functionToCall !== 'undefined') {
    if (turnOnFirst) {
      setRGBLED(1, this.ipAddress, this.port,  functionToCall);
    }
    else {
      functionToCall();
    }
    self.emit('data', data);
  }
};

function setRGBLED(on, ipAddress, port, callback) {
  var cmdByte = (on ? cmdOnByte : cmdOffByte);
  sendUDPCommand(cmdByte, valByteNA, ipAddress, port, callback);
}

const MODENEXT = true;
const MODEPREV = false;
function setRGBMode(nextMode, ipAddress, port) {
  var cmdByte = (nextMode ? cmdModeNextByte : cmdModePrevByte);
  sendUDPCommand(cmdByte, valByteNA, ipAddress, port);
}

function setRGBColour(valueByte, ipAddress, port) {
  sendUDPCommand(cmdColourByte, valueByte, ipAddress, port);
}

const cmdModePrevByte = 0x28;
const cmdModeNextByte = 0x27;
const cmdOffByte = 0x21;
const cmdOnByte = 0x22;
const cmdColourByte = 0x20;
const valByteNA = 0x00;
const cmdEndByte = 0x55;

function sendUDPCommand(cmdByte, valByte, ipAddress, port, callback) {
  var didFinishSend = function (err, bytes) {
    client.close();
    if (typeof callback !== 'undefined') {
      setTimeout(callback, 100);
    }
  }
  var cmd = new Buffer([cmdByte, valByte, cmdEndByte]);
  var client = dgram.createSocket('udp4');
  client.send(cmd, 0, cmd.length, port, ipAddress, didFinishSend)
}

