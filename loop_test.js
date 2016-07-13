var Mic = require('mic');
var Speaker = require('speaker');

var rate = 44100;
var channels = 2;
var bitDepth = 24


var micConfig = { 
  'rate': rate, 
  'channels': channels, 
  'debug': true, 
  'device': 'hw:0,0'
} 

var mic = Mic(micConfig);

// Create the Speaker instance
var speaker = new Speaker({
  channels: channels,          // 2 channels
  bitDepth: 16,         // 16-bit samples
  sampleRate: rate     // 44,100 Hz sample rate
});


var micInputStream = mic.getAudioStream();

micInputStream.pipe(speaker);

micInputStream.on('data', function(data) {
    console.log("Recieved Input Stream: " + data.length);
});

micInputStream.on('error', function(err) {
    cosole.log("Error in Input Stream: " + err);
});

micInputStream.on('startComplete', function() {
        console.log("Got SIGNAL startComplete");
        
        setTimeout(function() {
                mic.stop();
            }, 10000);
        
    });

micInputStream.on('stopComplete', function() {
        console.log("Got SIGNAL stopComplete");
    });

micInputStream.on('silence', function() {
        console.log("Got SIGNAL silence");
    });

micInputStream.on('processExitComplete', function() {
        console.log("Got SIGNAL processExitComplete");
    });

mic.start();
