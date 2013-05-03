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

  if (typeof this._opts.lllrgb === "undefined") {
    this._opts.lllrgb = new LimitlessLEDRGB();
  }

  app.on('client::up',function(){
      // Register a device 
      self.emit('register', self._opts.lllrgb);
  });
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
  this._opts.lllrgb.setIpPort(ipAddress, port);
  this._opts.lllrgb.emit('data', '000000');
}

// Export it
module.exports = myModule;

