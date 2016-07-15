var Mic = require('mic');
var Transform = require('stream').Transform;
var net = require('net');

var PORT = 52280;
var RATE = 44100;
var CHANNELS = 2;
var BIT_DEPTH = 24;

var micConfig = {
  'rate': RATE,
  'channels': CHANNELS,
  'device': 'hw:0,0'
};

var mic = Mic(micConfig);
var micInputStream = mic.getAudioStream();

/*
const audioProcessor = new Transform({
  transform(chunk, encoding, callback) {
    console.log(chunk, encoding);
    callback(null, chunk)
  }
});

micInputStream.pipe(audioProcessor);
audioProcessor.pipe(speaker);
*/


net.createServer(function(socket) {
  remoteClient = socket.remoteAddress + ':' + socket.remotePort

  console.log('Connected: ' + remoteClient);
  
  mic.start();
  micInputStream.pipe(socket);
 
  socket.on('data', function(data) {
    console.log('Data: ' + remoteClient + ':: ' + data);
  });

  socket.on('close', function(data) {
    console.log('Data: ' + remoteClient);
  });

}).listen(PORT);

