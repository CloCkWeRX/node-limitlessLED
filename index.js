var LimitlessLEDRGB = require('./lib/LimitlessLEDRGB')
  , util = require('util')
  , stream = require('stream')
  , configHandlers = require('./lib/config')

// Give our module a stream interface
util.inherits(LimitlessLEDDriver,stream);

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

  if ( !this._opts.lightGroups ) {
    this._opts.lightGroups = [];
  }

  this.registeredDevices = {};

  console.log( 'Light Groups: ', this._opts.lightGroups );

  app.on('client::up',function(){
      // Register a device
      if (opts.ipAddress) {
		this.registerAll( );
      }
  }.bind(this));
};

/**
 * Called when config data is received from the cloud
 * @param  {Object} config Configuration data
 */
LimitlessLEDDriver.prototype.config = function(rpc, cb) {
  var self = this;

  if (!rpc) {
    return configHandlers.probe.call(this,cb);
  }

  switch (rpc.method) {
    /* configuring the hub */
    case 'manual_config_hub':
      return configHandlers.get_ip_port.call(this,rpc.params,cb);
      break;
    case 'manual_config_hub_store':
      return configHandlers.manual_config_hub_store.call(this,rpc.params,cb);
      break;
    
    /* adding light groups */
    case 'manual_group_add':
      return configHandlers.manual_group_add.call(this,rpc.params,cb);
      break;
    case 'manual_group_add_post':
      return configHandlers.manual_group_add_post.call(this,rpc.params,cb);
      break;
    
    /* */
    default: return cb(true); break;
  }
};

LimitlessLEDDriver.prototype.addLightGroup = function(groupNumber, groupColorType) {
  var newGroup = {
    'number': groupNumber,
    'colorType': groupColorType
  };
  this._opts.lightGroups.push( newGroup );
  this.save();
  this.registerGroup( newGroup );
};

LimitlessLEDDriver.prototype.setIpPort = function(ipAddress, port) {
  this._opts.ipAddress = ipAddress;
  this._opts.port = port;
  this.save();
  this.registerAll();
};

LimitlessLEDDriver.prototype.registerGroup = function(group) {
  var device;
  var key = group.number + group.colorType;
  
  if ( key in this.registeredDevices ) {
	device = this.registeredDevices[key];
  } else {
    device = new LimitlessLEDRGB(this, group);
  }

  this.emit('register', device);
};

LimitlessLEDDriver.prototype.registerAll = function() {
  var lightGroups = this._opts.lightGroups;
  for ( var i = 0; i < lightGroups.length; i++ ) {
    this.registerGroup( lightGroups[i] );
  }
};

// Export it
module.exports = LimitlessLEDDriver;

