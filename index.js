var LimitlessLEDRGB = require('./lib/LimitlessLEDRGB')
  , util = require('util')
  , stream = require('stream')
  , configHandlers = require('./lib/config')

// Give our module a stream interface
util.inherits(myModule,stream);

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
function myModule(opts,app) {

  var self = this;

  this._log = app.log;
  this._opts = opts;

  app.on('client::up',function(){
      // Register a device
      if (opts.ipAddress) {
        this.register();
      }
  }.bind(this));
};

/**
 * Called when config data is received from the cloud
 * @param  {Object} config Configuration data
 */
myModule.prototype.config = function(rpc, cb) {
  var self = this;

  if (!rpc) {
    return configHandlers.probe.call(this,cb);
  }

  switch (rpc.method) {
    case 'get_ip_port':   return configHandlers.get_ip_port.call(this,rpc.params,cb); break;
    case 'store_ip_port':  return configHandlers.store_ip_port.call(this,rpc.params,cb); break;
    default:               return cb(true);                                              break;
  }
};

myModule.prototype.setIpPort = function(ipAddress, port) {
  this._opts.ipAddress = ipAddress;
  this._opts.port = port;
  this.save();
  this.register();
};

myModule.prototype.register = function() {
  var llrgb = new LimitlessLEDRGB(this._opts.ipAddress, this._opts.port);
  this.emit('register', llrgb);
};

// Export it
module.exports = myModule;

