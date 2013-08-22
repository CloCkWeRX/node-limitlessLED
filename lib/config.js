var exports = module.exports
 ,  messages = require('./config_messages')

exports.probe = function(cb) {
  cb(null, messages.probeGreeting);
};

exports.get_ip_port = function(params,cb) {
  var result = messages.getIpPort;
  // a bit hacky, but fill in the ip/port so it maintains visual state
  result['contents'][1]['value'] = this.opts.ipAddress;
  result['contents'][2]['value'] = this.opts.port;
  cb(null, result);
};

exports.manual_config_hub_store = function(params,cb) {
  this.setIpPort.call(this, params.lll_ip_address, params.lll_port);
  cb(null, messages.finish);
};

exports.manual_group_add = function(params,cb) {
  cb(null, messages.manual_group_add);
};

exports.manual_group_add_post = function(params,cb) {
  this.addLightGroup.call(this, params.lll_group, params.lll_colour);
  cb(null, messages.finish);
};
