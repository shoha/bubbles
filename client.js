var Speaker = require('speaker');
var net = require('net');
var os = require('os');

var MY_HOST = os.hostname()
var PORT = 52280;
var RATE = 44100;
var CHANNELS = 2;
var BIT_DEPTH = 16;

if(process.env.DEBUG) {
  var CLIENT_MAP = {
    'Hannahs-Air.home': 'Hannahs-Air.home'
  }
} else {
  var CLIENT_MAP = {
    "bubble-server-0.local": "bubble-server-1.local",
    "bubble-server-1.local": "bubble-server-2.local",
    "bubble-server-2.local": "bubble-server-3.local",
    "bubble-server-3.local": "bubble-server-0.local"
  }
}


var launchClient = function() {
  var speaker = new Speaker({
    channels: CHANNELS,
    sampleRate: RATE,
    bitDepth: BIT_DEPTH
  });

  var client = new net.Socket();

  console.log(MY_HOST, CLIENT_MAP[MY_HOST])

  client.connect({ host: CLIENT_MAP[MY_HOST], port: PORT }, function() {
    console.log('Connected: ' + CLIENT_MAP[MY_HOST] + ':' + PORT);
    client.pipe(speaker);
  });

  client.on('close', function(data) {
    console.log('Closed');
    client.unpipe();
    client = undefined;
    attemptToReconnect();
  });

  client.on('error', function() {
    console.log('Error');
  });
};

var attemptToReconnect = function() {
  setTimeout(function() {
    console.log('Attempting to reconnect.');
    launchClient()
  }, 3000);
};

launchClient();

