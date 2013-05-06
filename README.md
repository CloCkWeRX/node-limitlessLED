4/30/13 - Added port variable - default: 50000


==================
ninja-limitlessLED
==================

NinjaBlocks module for LimitlessLED lights

Currently disabled by default in the client, but can be easily enabled by editing index.js:
 - configure the LimitlessLED router to be on your network, noting it's IP address
 - set the constant "ipLimitlessLEDRouter" to the IP address of the LimitlessLED router
 - set the constant "enabled" to be true

TODO:
- Implement light protocol instead of simple RGB LED
    (eg https://github.com/ninjablocks/ninja-zigbee/commit/65bf40748d2201bb83fe6bf58d3069ed19542fd0)
- Implement white light comms
