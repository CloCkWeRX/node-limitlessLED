/* LimitlessLED Driver for Ninja Blocks
 * 
 * LimitlessHub - Manages light groups (aka "devices") on a single "WiFi Receiver Bridge" hub
 *
 * Hub options object looks like:
 *   {
 *     'name': hub-name,
 *     'identifier': hub-id,
 *     'lightGroups': [ ... ],
 *     'connectionDetails': null or { ipAddress: ..., port: ... }
 *   }
 *
 */

var LimitlessLightGroup = require('./LimitlessLightGroup');

function LimitlessHub(driver, options) {
  this._driver = driver;
  this._options = options;
  
  this.registered = false;
  
  this.registeredDevices = {};
}

module.exports = LimitlessHub;

/**
 * Returns whether the hub is fully configured (has an IP defined, etc)
 */
LimitlessHub.prototype.isConfigured = function() {
  return (this._options.connectionDetails != null);
}

/**
 * Called when ready to re-register all previous devices
 */
LimitlessHub.prototype.clientUp = function() {
  if ( !this.registered && this.isConfigured() ) {
    this.registerAllGroups( );
  }
};

/**
 * Called by the LimitlessLEDDriver when the hub is being deregistered.
 */
LimitlessHub.prototype.deregister = function(newName) {
  // FIXME: should send this upstream (removing the devices)
};

/**
 * Called by the LimitlessLEDDriver to serialise the hub into the 'opts' data.
 */
LimitlessHub.prototype.serialize = function() {
  return this._options;
};

/**
 * Called by the LimitlessLightGroup to get the suffix assigned for the devices.
 */
LimitlessHub.prototype.getDeviceSuffix = function() {
  return this._options.identifier;
};

/**
 * Called by the LimitlessLightGroup to get the ipAddress and port of the hub.
 */
LimitlessHub.prototype.getConnectionDetails = function() {
  return this._options.connectionDetails;
};

/**
 * Called by the LimitlessLEDDriver to serialise the hub into the 'opts' data.
 */
LimitlessHub.prototype.addLightGroup = function(groupNumber, groupColorType) {
  var newGroup = {
    'number': groupNumber,
    'colorType': groupColorType
  };
  
  // commit it to local config and push to client
  this._options.lightGroups.push( newGroup );
  this._driver.serializeAndSave();
  
  // push out the device
  this.registerGroup( newGroup );
};

/**
 * Called by the LimitlessLEDDriver when the friendly name is changed by the user
 */
LimitlessHub.prototype.setName = function(newName) {
  this._options.name = newName;
  this._driver.serializeAndSave();
};

/**
 * Called by the LimitlessLEDDriver when the connection details are changed by the user
 */
LimitlessHub.prototype.setConnectionDetails = function(connectionDetails) {
  this._options.connectionDetails = connectionDetails;
  this._driver.serializeAndSave();
  
  if ( !this.registered ) {
    this.registerAllGroups();
  }
};

LimitlessHub.prototype.registerGroup = function(group) {
  var device;
  var key = group.number + group.colorType + this.getDeviceSuffix();
  
  if ( key in this.registeredDevices ) {
    device = this.registeredDevices[key];
  } else {
    device = new LimitlessLightGroup(this, group);
  }

  this._driver.registerDevice( device ); // note that client will ignore dups
};

/**
 * Reregisters all light group devices.
 */
LimitlessHub.prototype.registerAllGroups = function() {
  this.registered = true;
  
  var lightGroups = this._options.lightGroups;
  for ( var i = 0; i < lightGroups.length; i++ ) {
    this.registerGroup( lightGroups[i] );
  }
};
