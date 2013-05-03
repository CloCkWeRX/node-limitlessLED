var exports = module.exports
 ,  messages = require('./config_messages')

exports.probe = function(cb) {
  cb(null, messages.getIpPort);
};

exports.store_ip_port = function(params,cb) {
  this.setIpPort.call(this, params.lll_ip_address, params.lll_port);
  cb(null, messages.finish);
};

