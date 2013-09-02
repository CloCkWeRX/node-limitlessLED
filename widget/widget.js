var entireWidget = function() {
//

var view = $(element);
var slider = view.find(".slider-vertical-brightness");
var amount = view.find('.brightness-value');
var toggler = view.find('.toggler');
var spin_el = view.find('.spinhere')[0];

var spinner = new Spinner({color:'#666'}).spin(spin_el);

var GUID = Object.keys(scope.Widget.devices)[0];
var device = scope.Widget.devices[GUID];

var fullColorMode = ( device.did == 1011 );

var receivedData = false;
var lastData = {
  _hex: 'FFFFFF',
  on: false,
  bri: 254,
  ct: 154
};

var pushData = function() {
  if ( !receivedData ) return;
  _.each(scope.Widget.devices, function(device, key) {
    // Use Browser Block to actuate
    var Device = new NinjaService.Device();
    Device.LoadData(device);
    Device.Emit(JSON.stringify(lastData));
    //console.log("Actuated", lastData);
  });
};

var updateBrightness = function( val ) {
  amount.text( val + '%' );
  
  lastData.bri = val * 254 / 100;
  pushData( );
};

var lightSwitch = function( on ) {
  lastData.on = on;
  pushData( );
};

var switchTheLight = function( on ) {
  toggler.find( '.toggle-slide' ).trigger( 'toggle', on );
  lightSwitch( on );
};

slider.slider({
  orientation: "vertical",
  range: "min",
  min: 0,
  max: 100,
  step: 10,
  value: 60,
  animate: 'slow',
  slide: function( event, ui ) {
    updateBrightness( ui.value );
  }
});
updateBrightness( slider.slider( 'value' ) );

toggler.toggles();
toggler.on( 'toggle', function(e, on) {
  lightSwitch(on);
});

//switchTheLight( false );
//switchTheLight( true );

// FUNCTIONS
function drawColorWheel(canvas, outsideRadius, insideRadius, colors) {
  var startAngle = -19;
  var arc = Math.PI / (colors.length/2);
  var ctx;

  if (canvas.getContext) {

    // debugger;
    ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;

    for(var i = 0; i < colors.length; i++) {
      var angle = startAngle + i * arc;
      ctx.fillStyle = colors[i];

      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, outsideRadius, angle, angle + arc, false);
      ctx.arc(canvas.width/2, canvas.height/2, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();
    }
  } else {
    // console.log("No context");
  }
}

function generateColorArray(numColors) {
  var colorArray = [];

  var startingHue = 0;
  var colorInterval = 360 / numColors;
  for (var i=0; i<numColors; i++) {
    var hue = startingHue + (i * colorInterval);
    var color = 'hsl(' + hue + ', 100%, 50%)';
    colorArray.push(color);
  }
  
  colorArray.push('#FFFFFF');

  return colorArray;
}

function generateWhiteColorArray(numColors) {
  var colorArray = [];

  var colorRange = 100;
  for (var i=0; i<numColors; i++) {
    var b = 255 - (i * colorRange / numColors);
    var color = 'rgb(255, 255, '+b+')';
    colorArray.push(color);
  }

  return colorArray;
}

function findPos(obj) {
  var curleft = 0, curtop = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return { x: curleft, y: curtop };
  }
  return undefined;
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}


// INIT
var view = $(element);
var colorwheel = view.find(".colorPicker");
var colors = fullColorMode ? generateColorArray(16) : generateWhiteColorArray(8);

// DRAW COLOR WHEEL
drawColorWheel(colorwheel[0], 50, 30, colors);


// RECEIVING DEVICE DATA
scope.onData = function(data) {
  //console.log( 'DATA', data );
  var hex;
  if ( !data || !data.DA || data.DA.length <= 0 ) {
    data = {DA:"{\"on\":false}"};
  }
  if ( data.DA[0] == '{' ) {
    lastData = JSON.parse( data.DA );
    hex = lastData._hex;
    
    if ( !receivedData ) {
      // sync up display
      //toggler.find( '.toggle-slide' ).trigger( 'toggle', lastData.on );
      toggler.toggles({on:lastData.on});
      var brightnessPercent = parseInt( lastData.bri * 100 / 254 );
      if ( brightnessPercent < 0 ) brightnessPercent = 0;
      if ( brightnessPercent > 100 ) brightnessPercent = 100;
      slider.slider( 'value', brightnessPercent );
      amount.text( brightnessPercent + '%' );
    }
  } else {
    hex = data.DA;
    lastData._hex = hex;
  }
  view.find(".currentcolor").css({
    backgroundColor: "#" + hex
  });
  $(spin_el).hide();
  receivedData = true;
};

//console.log( 'last_data', device.last_data );
scope.onData( device.last_data  );


// ACTUATING DEVICE
colorwheel.on("click", function(event) {
  var wheel = event.currentTarget;
  // determine color
  var pos = findPos(wheel);
  var x,y;
  if (event.type.indexOf("touch") >= 0) {
    x = event.originalEvent.touches[0].pageX - pos.x;
    y = event.originalEvent.touches[0].pageY - pos.y;
  } else {
    x = event.pageX - pos.x;
    y = event.pageY - pos.y;
  }
  var coord = "x=" + x + ", y=" + y;
  var c = wheel.getContext('2d');
  var p = c.getImageData(x, y, 1, 1).data;
  var hex = ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  var pval = hex.toUpperCase();

  lastData._hex = pval;
  if ( fullColorMode ) {
    var col = new Color( '#' + pval );
    var hue = parseInt( col.hslData( )[0] * 65535 );
    
    // note:
    // either no saturation (white) or full saturation (colour).
    // the LLL devices don't support anything else!
    var sat = col.hslData( )[1] == 0 ? 0 : 254;
    
    lastData.hue = hue;
    lastData.sat = sat;
  } else {
    // pull out the white value
    var whitenessPercent = ( p[2] - (255-100) );
    lastData.ct = ( (100 - whitenessPercent) * (500 - 154) / 100 ) + 154;
  }
  pushData( );
});

//
};

var document = element[0].ownerDocument;

var loadScript = function( url, callback ) {
  var s = document.createElement("script");
  s.src = url;
  if(s.addEventListener) {
    s.addEventListener("load",callback,false);
  } else if(s.readyState) {
    s.onreadystatechange = callback;
  }
  document.body.appendChild(s);
};

loadScript( 'https://rawgithub.com/simontabor/jquery-toggles/master/toggles.min.js', function() {
  loadScript( 'https://rawgithub.com/eligrey/color.js/master/color.min.js', function() {
    loadScript( 'https://a.ninja.is/components/spin.js/dist/spin.min.js', entireWidget );
  } );
} );
