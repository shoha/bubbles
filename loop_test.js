var Mic = require('mic');
var Speaker = require('speaker');
var Writable = require('stream').Writable;
var FFT = require('fft.js');

var RATE = 44100;
var CHANNELS = 2;
var BIT_DEPTH = 16;


var micConfig = {
  'rate': RATE,
  'channels': CHANNELS,
  'debug': true,
  'device': 'hw:0,0'
}

var mic = Mic(micConfig);

// Create the Speaker instance
var speaker = new Speaker({
  channels: CHANNELS,          // 2 channels
  bitDepth: BIT_DEPTH,         // 16-bit samples
  sampleRate: RATE     // 44,100 Hz sample rate
});


var micInputStream = mic.getAudioStream();

// micInputStream.pipe(speaker);

var splitChannels = function(chunk) {
  left = Buffer.alloc(chunk.length / 2);
  right = Buffer.alloc(chunk.length / 2);

  var i = 0;

  for(i; i < chunk.length; i = i + 2) {
    left[i] = chunk[i];
    right[i] = chunk[i + 1]
  }

  return [left, right];
}

var mergeChannels = function(left, right) {
  output = Buffer.alloc(left.length * 2);

  for(var i = 0; i < left.length; i++) {
    output[i] = left[i];
    output[i + 1] = right[i];
  }

  return output;
}

var transform = Writable();
var bufferedChunks = 0
var chunkBuffer = []


transform._write = function(chunk, enc, next) {
  console.log(chunk);

  if(bufferedChunks < 4) {
    chunkBuffer[bufferedChunks] = chunk;
    bufferedChunks += 1;
    next();
    return;
  }
  else {
    chunk = Buffer.concat(chunkBuffer);
    chunkBuffer.length = 0;
    bufferedChunks = 0;
  }

  channels = splitChannels(chunk, 0);

  f = new FFT(256);
  leftTransform = f.createComplexArray();
  leftReversed = f.createComplexArray();
  leftReal = Buffer.alloc(fftSize);
  rightTransform = f.createComplexArray();
  rightReversed = f.createComplexArray();
  rightReal = Buffer.alloc(fftSize);


  f.realTransform(leftTransform, channels[0]);
  f.completeSpectrum(leftTransform);
  f.fromComplexArray(leftTransform, leftReal);

  f.realTransform(rightTransform, channels[1]);
  f.completeSpectrum(rightTransform);
  f.fromComplexArray(rightTransform, rightReal);

  f.inverseTransform(leftReversed, leftTransform);
  f.inverseTransform(rightReversed, rightTransform);

  newChunk = mergeChannels(leftReversed, rightReversed);
  console.log(newChunk);
  speaker.write(newChunk);


  // speaker.write(chunk);
  // var delay = Math.random() * 0

  // setTimeout(function() {
  //   speaker.write(chunk)

  // }, delay)
  next()
}

micInputStream.pipe(transform);

micInputStream.on('data', function(data) {
    console.log("Recieved Input Stream: " + data.length);
});

micInputStream.on('error', function(err) {
    cosole.log("Error in Input Stream: " + err);
});

micInputStream.on('startComplete', function() {
        console.log("Got SIGNAL startComplete");

        // setTimeout(function() {
        //         mic.stop();
        //     }, 10000);

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
