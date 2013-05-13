4/30/13 - Added port variable - default: 50000


==================
ninja-limitlessLED (Same as MiLight, EasyBulb, ...)
==================

NinjaBlocks module for LimitlessLED lights

Configurable via the dashboard:
 - configure the LimitlessLED router to be on your network, noting it's IP address
 - click the Drivers button in the top right corner of the dashboard
 - after the drivers for the connected block have displayed, click configure of the LimitlessLED driver
 - Enter the IP address and confirm

TODO:
- Implement light protocol instead of simple RGB LED
    (eg https://github.com/ninjablocks/ninja-zigbee/commit/65bf40748d2201bb83fe6bf58d3069ed19542fd0)
- Implement white light comms
