var LimitlessLEDRGB = require('./lib/LimitlessLEDRGB')
  , util = require('util')
  , stream = require('stream');

// Give our module a stream interface
util.inherits(myModule,stream);

// router must be configured to connect to your internet connected LAN
const ipLimitlessLEDRouter = "192.168.x.x";
const portLimitlessLEDRouter = "50000";
const enabled = false;

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

  app.on('client::up',function(){

    if (enabled) {
      // Register a device 
      self.emit('register', new LimitlessLEDRGB(ipLimitlessLEDRouter, portLimitlessLEDRouter));
    }
    else {
      app.log.info('LimitlessLED module is not enabled.');
    }
  });
};

/**
 * Called when config data is received from the cloud
 * @param  {Object} config Configuration data
 */
myModule.prototype.config = function(config) {

};

// Export it
module.exports = myModule;
