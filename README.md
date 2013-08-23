## ninja-limitlessLED

NinjaBlocks module for LimitlessLED lights (Same as MiLight, EasyBulb, ...)

![Widgets](http://i.imgur.com/yzq4bPl.png)

### Setting up your WiFi Receiver Bridge

Your Ninja Block will need access to the WiFi Receiver Bridge to control your lights.
If you haven't yet got your WiFi Receiver Bridge on your wireless network, here's a quick guide:

* Reset your Wifi Receiver Bridge
* Connect your computer to the wifi network "wifi_socket"
* Open your browser and visit `http://192.168.1.100`
* In the wireless settings section:
  * Work Type: `Sta` (connects to your existing network as a client)
  * SSID: the exact name of your wifi network, case-sensitive
  * Encryption:
    * WPA2-PSK(TKIP) = "WPA2 Personal"
  * Key Format: `ASCII` (if you use a text string as your password)
  * Encryption Key: your wifi network password
* **Save** in the Wireless Settings section (NOT at the bottom of the page)

![Wireless Settings](https://dl.dropboxusercontent.com/u/13788283/ninjadocs/Screen%20Shot%202013-08-23%20at%2011.38.50%20AM.png)

* Once the page reloads, in the network settings section:
  * Untick DHCP Enable
  * Fixed IP Address: enter the IP address for the bridge.
    * Pick an IP that no other computer is using, and that your router won't give out
    * Save this IP, you'll need it when setting up your Ninja driver
  * Subnet Mask: usually 255.255.255.0 (use the same as your computer uses)
  * Gateway Address: usually your IP with ".1" at the end (use the same as your computer uses)
  * DNS Address: usually the same as Gateway Address (use the same as your computer uses)
* **Save** in the Network Settings section (NOT at the bottom of the page)

![Network Settings](https://dl.dropboxusercontent.com/u/13788283/ninjadocs/Screen%20Shot%202013-08-23%20at%2011.39.05%20AM.png)

* Go to the "System" tab
* Press "Restart System". ![Restart location](https://dl.dropboxusercontent.com/u/13788283/ninjadocs/Screen%20Shot%202013-08-23%20at%2011.40.16%20AM.png)
* If you got your settings right, the LINK light will come up and your bridge will be ready.

### Pairing lights

Pair lights using the "Wifi Controller 2" app for iPhone, or any app that can work with the Wifi bridge.
The app remote will be the same as the provided physical remotes, so use the same pairing method
("speed" for RGB, "channel on" for whites). Once done, your LimitlessLED lights will be paired to your 
WiFi bridge rather than the remote, and ready for the Ninja driver to use.

### Install the driver on your Ninja Block

* SSH into your block: `ssh ubuntu@ninjablock.local`
* `cd /opt/ninja/drivers`
* `git clone https://github.com/theojulienne/ninja-limitlessLED.git ninja-limitlessLED-new`
* Restart the ninjablocks client: `sudo service ninjablock restart`

```sh
ubuntu@ninjablock:~$ cd /opt/ninja/drivers/
ubuntu@ninjablock:/opt/ninja/drivers$ git clone https://github.com/theojulienne/ninja-limitlessLED.git ninja-limitlessLED-new
Cloning into 'ninja-limitlessLED-new'...
remote: Counting objects: 120, done.
remote: Compressing objects: 100% (64/64), done.
remote: Total 120 (delta 55), reused 115 (delta 50)
Receiving objects: 100% (120/120), 19.91 KiB, done.
Resolving deltas: 100% (55/55), done.
ubuntu@ninjablock:/opt/ninja/drivers$ sudo service ninjablock restart
[sudo] password for ubuntu:
ninjablock stop/waiting
ninjablock start/running, process 1339
ubuntu@ninjablock:/opt/ninja/drivers$
```

### Adding to Dashboard

Initial setup:
* Press the `Drivers` button in the top right of the Dashboard
* Press `Configure` next to Ninja Limitlessled
* Press `Configure LimitlessLED Hub`
* Enter the IP Address of the "WiFi Receiver Bridge" (and enter the port if you changed it)
* Press `Save`

To set up your actual light groups:
* Press the `Drivers` button in the top right of the Dashboard
* Press `Configure` next to Ninja Limitlessled
* Press `Add Light Group`
* RGB:
  * RGB currently only supports single "All" addressing, so select "All" as the Light Group
  * Select "RGB" as the color
* White:
  * Select the colour group (four are supported) or "All" for a device that controls all 4 colour groups.
  * Select "White" as the color
* Press `Save`

### Adding the custom widget to BETA Dashboard

Enable the Beta Dashboard if you haven't already:
* Go to the `Settings` icon
* Select the `Preferences` tab
* Toggle `Enable Beta Dashboard` to Enabled
* You can now see the Beta Dashboard icon on the left

You will likely see RGB Color Wheel widgets for your LimitlessLED devices, now use the LimitlessLED widget:
 * Find the appropriate widget (currently look for "allrgb" or "1white" ... "4white" in the device type)
 * Paste `https://gist.github.com/theojulienne/b8e3e09729faa49353b4` in the Gist box and click Gist/Import
 * Your widget will change to give you a color/temperature wheel, brightness slider and on/off button.

