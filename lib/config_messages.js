
exports.getIpPort = {
  "contents":[
    { "type": "paragraph", "text":"Please enter the IP Address and Port of the LimitlessLED Hub"},
    { "type": "input_field_text", "field_name": "lll_ip_address", "value": "10.0.1.10", "label": "LimitlessLED Hub IP Address", "placeholder": "192.168.1.100", "required": true},
    { "type": "input_field_text", "field_name": "lll_port", "value": "50000", "label": "LimitlessLED Hub Port", "placeholder": "50000", "required": true},
    { "type": "submit", "name": "Save", "rpc_method": "store_ip_port" },
    { "type": "close", "text": "Cancel" }
  ]
};

exports.finish = {
  "finish": true
};

