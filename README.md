4/30/13 - Added port variable - default: 50000


## ninja-limitlessLED

NinjaBlocks module for LimitlessLED lights (Same as MiLight, EasyBulb, ...)

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
* Once the page reloads, in the network settings section:
  * Untick DHCP Enable
  * Fixed IP Address: enter the IP address for the bridge.
    * Pick an IP that no other computer is using, and that your router won't give out
    * Save this IP, you'll need it when setting up your Ninja driver
  * Subnet Mask: usually 255.255.255.0 (use the same as your computer uses)
  * Gateway Address: usually your IP with ".1" at the end (use the same as your computer uses)
  * DNS Address: usually the same as Gateway Address (use the same as your computer uses)
* **Save** in the Network Settings section (NOT at the bottom of the page)
* Go to the "System" tab
* Press "Restart System".
* If you got your settings right, the LINK light will come up and your bridge will be ready.

### Adding to Dashboard

### Adding the custom widget to BETA Dashboard
