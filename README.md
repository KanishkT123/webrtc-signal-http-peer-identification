# webrtc-signal-http-peer-identification
A [webrtc-signal-http](https://github.com/bengreenier/webrtc-signal-http) extension that only displays relevant peers to connected clients and servers

This ensures that all connected peers only see the peers that they can connect to. Therefore, servers only see clients, and vice versa. Unidentified clients see both. 

## Getting started

> Learn about the [RESTful API extension](#restful-api) via the OpenAPI Doc ([hosted](https://rebilly.github.io/ReDoc/?url=https://raw.githubusercontent.com/bengreenier/webrtc-signal-http-capacity/master/swagger.yml)) to understand how clients should change their interaction with the service when using this extension.


To install a signal server including this extension that can be used in a cli `npm install -g webrtc-signal-http-peer-identification`. To run it, just use `webrtc-signal-http-peer-identification` from the command line, using the `PORT` environment variable to configure it's listening port.

To consume this server in combination with [webrtc-signal-http](https://github.com/bengreenier/webrtc-signal-http) and other possible extensions, `npm install webrtc-signal-http webrtc-signal-http-capacity` and then see [this sample file](index.js) for an example of code that works using the server and this extension.

## Configuration

> These values modify the module behavior via Environment Variables.

+ `WEBRTC_PEERID_RESPECT_CAPACITY` - hands out peers such that capacity reported by the [webrtc-signal-http-capacity](https://github.com/bengreenier/webrtc-signal-http-capacity) plugin is respected
+ `WEBRTC_PEERID_PAIRING` - pairs clients to servers. if `WEBRTC_PEERID_RESPECT_CAPACITY` is set, capacity will be considered, otherwise 1:1 pairings will be used

## RESTful API

To understand the base API provided by [webrtc-signal-http](https://github.com/bengreenier/webrtc-signal-http), look at the [docs for that project](https://github.com/bengreenier/webrtc-signal-http#restful-api). This documents the API endpoints this extension adds.

## Extension API

To understand the base API provided by [webrtc-signal-http](https://github.com/bengreenier/webrtc-signal-http), look at the [docs for that project](https://github.com/bengreenier/webrtc-signal-http#extension-api). This documents the javascript API this extension adds. :sparkles:

### module.exports

> This is the exported behavior, you access it with `require('webrtc-signal-http-peer-identification')
[Function] -  __Returns__ an [express](https://expressjs.com/) `router` object.

#### router.peerList

[Object] - can be used to retrieve a `PeerList` from the express `router`. __Returns__ a [recognitionPeerList](#recognitionPeerList) object.

####recognitionPeerList

[Class] - Extends [PeerList](https://github.com/bengreenier/webrtc-signal-http/#peerlist) with the ability to sort peers and only display relevant, complementary peers

#### peerList

[Object] - An existing PeerList to base our recognitionPeerList on.

## License

MIT
