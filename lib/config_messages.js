exports.probeGreeting = {
  "contents":[
    { "type": "paragraph", "text": "Start by configuring the IP and port of your hub(s):"},
    { "type": "input_field_select", "field_name": "lll_hub", "label": "Hub", "options": [], "required": false },
    { "type": "submit", "name": "Modify Hub", "rpc_method": "manual_modify_hub" },
    { "type": "submit", "name": "Remove Hub", "rpc_method": "manual_remove_hub" }, // FIXME
    
    { "type": "paragraph", "text": "Or add an additional hub:"},
    { "type": "submit", "name": "Add Additional Hub", "rpc_method": "manual_add_hub" },
    
    { "type": "paragraph", "text": "Once configured, set up one or more light groups:"},
    { "type": "submit", "name": "Add Light Group", "rpc_method": "manual_group_add" } // FIXME
  ]
};

exports.manual_modify_hub = {
  "contents":[
    { "type": "paragraph", "text":"Please enter the IP Address and Port of the LimitlessLED Hub"},
    { "type": "input_field_text", "field_name": "lll_name", "value": "Default", "label": "LimitlessLED Hub Name", "placeholder": "Default", "required": true},
    { "type": "input_field_text", "field_name": "lll_ip_address", "value": "192.168.1.100", "label": "LimitlessLED Hub IP Address", "placeholder": "192.168.1.100", "required": true},
    { "type": "input_field_text", "field_name": "lll_port", "value": "50000", "label": "LimitlessLED Hub Port", "placeholder": "50000", "required": true},
    { "type": "input_field_hidden", "field_name": "lll_hub", "value": "", "required": false},
    { "type": "submit", "name": "Save", "rpc_method": "manual_config_hub_store" },
    { "type": "close", "text": "Cancel" }
  ]
};

exports.manual_group_add = {
  "contents": [
    { "type": "paragraph", "text":"Choose the group you wish to control, and light color:"},
    { "type": "input_field_select", "field_name": "lll_hub", "label": "Hub", "options": [], "required": false },
    { "type": "input_field_select", "field_name": "lll_group", "label": "Light Group", "options": [
      { "name": "All", "value": "all", "selected": true },
      { "name": "1", "value": "1", "selected": false },
      { "name": "2", "value": "2", "selected": false },
      { "name": "3", "value": "3", "selected": false },
      { "name": "4", "value": "4", "selected": false }
    ], "required": true },
    { "type": "input_field_select", "field_name": "lll_colour", "label": "Color", "options": [
      { "name": "RGB", "value": "rgb", "selected": true },
      { "name": "White", "value": "white", "selected": false }
    ], "required": true },
    { "type": "paragraph", "text": ""},
    { "type": "submit", "name": "Save", "rpc_method": "manual_group_add_post" },
    { "type": "close", "text": "Cancel" }
  ]
};

exports.finish = {
  "finish": true
};

