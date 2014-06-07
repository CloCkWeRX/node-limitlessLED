## node-limitlessLED

Node module for LimitlessLED lights (Same as MiLight, EasyBulb, ...)

###
```
npm install node-limitlessLED
```

### Usage

```
var colours = [BLUE, GREEN, CYAN, RED, MAGENTA, YELLOW];
var lllColourLookup = [LLL_BLUE, LLL_GREEN, LLL_CYAN, LLL_RED, LLL_MAGENTA, LLL_YELLOW];
```

```
var light = new LimitlessLightGroup({
    connectionDetails: {
      port: 8899, // May be port 50000 for older hubs
      ipAddress: 192.168.1.1 // IP Address assigned
    },
    identifer: "hub-1"
  }, {
    colorType: 'rgbw',  // Valid options: rgbw, rgb
    number: 1 // Corresponds to the channel you paired the light with
  });

light.doWarmthVoodoo(100, function () {
  console.log("Success");
});

light.doBrightnessVoodoo(100, function () {
  console.log("Success");
});

light.sendDirectBrightnessCommand(100, function () {
  console.log("Success");
});

light.sendRGBColorCommand(hueval, function () {
  console.log("Success");
});

light.sendRGBWhiteColorCommand(function () {
  console.log("Success");
});

light.repeatCommand(toRepeat, times, function () {
  console.log("Success");
});

// TODO Document fully!
// Takes a string and guesses that it's JSON?
light.write(data).on('data', function (data) {
  console.log(data);
});

light.writeRGBW({
  bri: 100, 
  on: true
  sat: 0 // White mode
  hue: 100
});

light.sendBrightnessUpCommand(function () {
  console.log("Success");
});

light.sendBrightnessDownCommand(function () {
  console.log("Success");
});

light.sendWarmthUpCommand(function () {
  console.log("Success");
});

light.sendWarmthDownCommand(function () {
  console.log("Success");
});

// "on", "off"
light.sendWhiteGroupCommand("on", function () {
  console.log("Success");
});

// "on", "off", "toWhite"
light.sendRGBWGroupCommand("off", function () { 
  console.log("Success");
});

light.sendRGBLEDOnCommand(true, function () {
  console.log("Success");
});
```


### Setting up your WiFi Receiver Bridge

Your Ninja Block will need access to the [WiFi Receiver Bridge](http://www.limitlessled.com/shop/wifi-udp-receiver-bridge/) to control your lights.
If you haven't yet got your WiFi Receiver Bridge on your wireless network, here's a quick guide:

#### Version 3.0+ ####
* Reset your Wifi Receiver Bridge
* Connect your computer to the wifi network "milight"
* Use an app to configure wifi, as per the PDF instructions.
* Check your router for the new address assigned by DHCP
* Open your browser and visit `http://192.168.1.?` - check you get prompted for auth


#### Version 2.0 ####
* Reset your Wifi Receiver Bridge
* Connect your computer to the wifi network "wifi_socket"
* Open your browser and visit `http://192.168.1.100`

<img src="https://dl.dropboxusercontent.com/u/13788283/ninjadocs/limitless/wifi-settings-1.png" width="400" border="1" align="right">

* In the wireless settings section:
  * Work Type: `Sta` (connects to your existing network as a client)
  * SSID: the exact name of your wifi network, case-sensitive
  * Encryption:
    * WPA2-PSK(TKIP) = "WPA2 Personal"
  * Key Format: `ASCII` (if you use a text string as your password)
  * Encryption Key: your wifi network password
* **Save** in the Wireless Settings section (NOT at the bottom of the page)

<img src="https://dl.dropboxusercontent.com/u/13788283/ninjadocs/limitless/wifi-settings-2.png" width="400" border="1" align="right">

* Once the page reloads, in the network settings section:
  * Untick DHCP Enable
  * Fixed IP Address: enter the IP address for the bridge.
    * Pick an IP that no other computer is using, and that your router won't give out
    * Save this IP, you'll need it when setting up your Ninja driver
  * Subnet Mask: usually 255.255.255.0 (use the same as your computer uses)
  * Gateway Address: usually your IP with ".1" at the end (use the same as your computer uses)
  * DNS Address: usually the same as Gateway Address (use the same as your computer uses)
* **Save** in the Network Settings section (NOT at the bottom of the page)

<img src="https://dl.dropboxusercontent.com/u/13788283/ninjadocs/limitless/system-restart.png" width="400" border="1" align="right">

* Go to the "System" tab
* Press "Restart System".

* If you got your settings right, the LINK indicator on the bridge will light up and your bridge will be ready.

### Pairing lights

Follow the instructions included in the official [WiFi Bridge Instruction PDF - March 2014](http://www.limitlessled.com/download/) or older [WiFi Bridge 2.0 Instruction PDF](http://www.limitlessled.com/download/LimitlessLED_WiFiBridgeInstructions_July2012_version2.pdf)
to pair your lights, but pair them using the "Wifi Controller 2" or similar app for iPhone/Android
**instead of the physical remotes** so that your lights are paired to the WiFi Bridge
(note that the app must be able to talk to an arbitrary IP, not just the default of 192.168.0.100 -
see the instruction PDF for more information).

The app will present a similar interface to the provided physical remotes, so use the same pairing method
("speed" for RGB, "channel on" for whites) as the instruction PDF suggests. Once complete, your LimitlessLED
lights will be paired to your WiFi bridge rather than the original remote, and ready for the Ninja driver to use!

**Make sure your lights are perfectly controllable from the phone app, otherwise the ninja driver will 
also not be able to control them!**


### Troubleshooting

The WiFi Receiver Bridge is very temperamental, it will probably take a couple of tries to get working.

Some notes that may help:
* The API and hardware is evolving. Check out http://www.limitlessled.com/dev/ if these instructions don't work; and don't forget to give us a pull request!
* Your WiFi network can't contain spaces, special characters, or anything else that confuses the interface.
  The interface is pretty flakey, so you'll actually need to change your network SSID or password if it's too
  complex! Hopefully limitless will release a better firmware update in the future.
* If the LINK light fails to come on: You probably configured it wrong. Try a different wifi setting, and make
  doubly sure you save the right section in the right order.
* If the bridge is connected and the LINK light turns on, but you can't pair a phone app to it, try resetting
  everything (unplug, replug), make sure you can access the bridge web UI by visiting `http://<bridge ip you entered>/`
  in your browser. Make sure the IP address is set right on both the web UI and your phone app, pray to the
  test gods some more, etc.
* If a phone app works but your Ninja Block can't control anything, make sure the Ninja Block has unrestricted access
  to the WiFi Receiver Bridge and is on the same local network. You can check this on your Ninja Block via SSH:

```
ubuntu@ninjablock:/opt/ninja$ curl -i --user "admin:000000" http://<wifi-bridge-ip>/
HTTP/1.0 200 OK
... more data ...
```

### Caveats

* The "WiFi Receiver Bridge" doesn't provide any feedback, so if you set the IP Address or port wrong, the
  widget will still display but will not be able to actuate. Similarly, you should make sure that all the LEDs
  are paired to the bridge and work completely **before** using the ninja driver, by using one of the free 
  iPhone/Android applications suggested by limitless.
* The LimitlessLED doesn't support setting or reading brightness directly, so when you set brightness the ninja
  driver sends multiple brightness up/down events to syncronise, then set, the brightness. This seems to work 
  most of the time, but it can occasionally get out of sync. You might see a slight over compensation as the driver
  overshoots (to calibrate) and gets back to the desired brightness value.
