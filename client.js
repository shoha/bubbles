var Speaker = require('speaker');
var net = require('net');

var HOST = '127.0.0.1';
var PORT = 52280;
var RATE = 44100;
var CHANNELS = 2;
var BIT_DEPTH = 16;

var speaker = new Speaker({
  channels: CHANNELS,
  sampleRate: RATE,
  bitDepth: BIT_DEPTH
});

var client = new net.Socket();

client.connect({ host: HOST, port: PORT }, function() {
  console.log('Connected: ' + HOST + ':' + PORT);
});

client.on('close', function(data) {
  console.log('Closed')
});

client.pipe(speaker);

