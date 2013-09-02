/* LimitlessLED Driver for Ninja Blocks
 * 
 * LimitlessLEDDriver - Base ninja driver for the LimitlessLEDs
 */

var LimitlessHub = require('./LimitlessHub')
  , util = require('util')
  , stream = require('stream')
  , configMessages = require('./config_messages')

// Give our module a stream interface
util.inherits(LimitlessLEDDriver,stream);

// Export it
module.exports = LimitlessLEDDriver;

/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default module configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the cloud
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the cloud
 */
function LimitlessLEDDriver(opts,app) {

  var self = this;

  this._log = app.log;
  this._opts = opts;
  this._optsNeedsSave = false;
  
  if ( typeof this._opts.lightHubs == 'undefined' ) {
    // we have no light hubs set, we are either a newly instantiated driver
    // OR we had the old layout, so we need to migrate.
    
    var connectionDetails = null;
    
    // previously, having an ip set meant it was configured and should be used
    if ( this._opts.ipAddress ) {
      connectionDetails = {
        'ipAddress': this._opts.ipAddress || "192.168.0.100",
        'port': this._opts.port || 50000
      };
    }
    
    var hubId = ''; // no id/suffix, for backwards compatibility
    
    this._opts = {
      'lightHubs': {
        '': {
          'name': 'Default',
          'identifier': hubId,
          'lightGroups': this._opts.lightGroups || [],
          'connectionDetails': connectionDetails
        }
      }
    };
    
    // changed, so save it!
    this._optsNeedsSave = true;
  }
  
  this.lightHubObjects = {};

//  console.log( 'Light Groups: ', this._opts.lightHubs );

  app.on('client::up',function(){
    if ( this._optsNeedsSave ) {
      this.save( );
    }
    
    this.clientUp( );
    // Register a device
    /*if (this._opts.ipAddress) {
      this.registerAll( );
    }*/
  }.bind(this));
};

/**
 * Called when ready to re-register all previous devices
 */
LimitlessLEDDriver.prototype.clientUp = function() {
  for ( var hubId in this._opts.lightHubs ) {
    var hubConfig = this._opts.lightHubs[hubId];
    
    var hub = new LimitlessHub( this, hubConfig );
    this.lightHubObjects[hubId] = hub;
    hub.clientUp( );
  }
  
};

/**
 * Called when config data is received from the cloud
 * @param  {Object} config Configuration data
 */
LimitlessLEDDriver.prototype.config = function(rpc, pushScreen) {
  var self = this;

  if (!rpc) {
    var result = configMessages.probeGreeting;
    
    var hubOptions = [];
    for ( var hubId in this._opts.lightHubs ) {
      var hubConfig = this._opts.lightHubs[hubId];
      if ( typeof hubConfig.identifier == 'undefined' ) continue;
      hubOptions.push( { "name": hubConfig.name, "value": hubConfig.identifier } );
    }
    
    var hubSelectField = result['contents'][1];
    hubSelectField.options = hubOptions;
    
    return pushScreen( null, result );
  }
  
  var params = rpc.params;
  
  switch (rpc.method) {
    /* screen to modify the hub */
    case 'manual_modify_hub':
      var hubId = params.lll_hub;
      var hubConfig = this._opts.lightHubs[hubId];
      
      if ( typeof hubConfig == 'undefined' ) {
        return pushScreen( null, configMessages.finish );
      }
      
      // fill in the ip/port so it maintains visual state
      var result = configMessages.manual_modify_hub;
      result['contents'][1]['value'] = hubConfig.name || "Default";
      result['contents'][2]['value'] = hubConfig.connectionDetails && hubConfig.connectionDetails.ipAddress || "192.168.0.100";
      result['contents'][3]['value'] = hubConfig.connectionDetails && hubConfig.connectionDetails.port || 50000;
      result['contents'][3]['value'] = hubId;
      
      return pushScreen(null, result);
      break;
    
    /* configuring the hub */
    
    case 'manual_config_hub_store':
      var hubId = params.lll_hub;
      var hubConfig = this._opts.lightHubs[hubId];
      
      if ( typeof hubConfig == 'undefined' ) {
        return pushScreen( null, configMessages.finish );
      }
      
      this.lightHubObjects[hubId].setName( params.lll_name );
      this.lightHubObjects[hubId].setConnectionDetails( {
        ipAddress: params.lll_ip_address || "192.168.0.100",
        port: parseInt( params.lll_port || "50000" )
      } );
      
      return pushScreen(null, configMessages.finish);
      break;
    
    /* adding light groups */
    case 'manual_group_add':
      return pushScreen( null, configMessages.manual_group_add);
      break;
    
    case 'manual_group_add_post':
      this.addLightGroup(params.lll_group, params.lll_colour);
      return pushScreen( null, messages.finish );
      break;
    
    /* */
    default: return cb(true); break;
  }
};

LimitlessLEDDriver.prototype.serializeAndSave = function() {
  // serialize each hub back into the opts object
  for ( var hubId in this._opts.lightHubs ) {
    var newConfig = this.lightHubObjects[hubId].serialize( );
    this._opts.lightHubs[hubId] = newConfig;
  }
  
  // commit those changes back to client
  this.save( );
};

LimitlessLEDDriver.prototype.registerDevice = function(device) {
  this.emit('register', device);
};
