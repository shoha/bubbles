var Mic = require('mic');
var Transform = require('stream').Transform;
var net = require('net');
var shell = require('shelljs')

var PORT = 52280;
var RATE = 44100;
var CHANNELS = 2;
var BIT_DEPTH = 24;

var getDevice = function() {
  if(process.env.MICROPHONE) {
    configureMic(process.env.MICROPHONE);
    return;
  }

    parseOutput = function(result) {
      console.log('Parsing ' + result.stdout);

      var usbLine = result.stdout.split('\n').find(function(line) { return line.indexOf('USB') > -1 });
      var hardwareRegex = /card (\d).*device (\d)/;
      var match = hardwareRegex.exec(usbLine);

      try {
        if(match && match[1] && match[2]) {
          foundDevice = 'hw:' + match[1] + ',' + match[2];
          console.log('Attempting to configure for ' + foundDevice);
          configureMic(foundDevice);
        } else {
          configureMic('hw:0,0');
        }

      } catch(ex) {
        console.log(ex);
        configureMic('hw:0,0');
      };
    };

  try {
    if(process.env.DEBUG){
      var result = { stdout: '**** List of CAPTURE Hardware Devices ****\ncard 0: I82801AAICH [Intel 82801AA-ICH], device 0: Intel ICH [Intel 82801AA-ICH]\n  Subdevices: 1/1\n  Subdevice #0: subdevice #0\ncard 0: I82801AAICH [Intel 82801AA-ICH], device 1: Intel ICH - MIC ADC [Intel 82801AA-ICH - MIC ADC]\n  Subdevices: 1/1\n  Subdevice #0: subdevice #0\ncard 1: Device [C-Media USB Audio Device], device 0: USB Audio [USB Audio]\n  Subdevices: 1/1\n  Subdevice #0: subdevice #0\n' };
      parseOutput(result);
    } else {
      shell.exec('arecord -l', parseOutput);
    }
  } catch(ex) {
    console.log(ex);

    configureMic('hw:0,0');
  }
};

var configureMic = function(device) {
  var micConfig = {
    'rate': RATE,
    'channels': CHANNELS,
    'device': device
  };

  var mic = Mic(micConfig);
  var micInputStream = mic.getAudioStream();

  mic.start();
  launchServer(micInputStream);

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

}

var launchServer = function(micInputStream) {
  net.createServer(function(socket) {
    remoteClient = socket.remoteAddress + ':' + socket.remotePort

    console.log('Connected: ' + remoteClient);

    micInputStream.pipe(socket);

    socket.on('data', function(data) {
      console.log('Data: ' + remoteClient + ':: ' + data);
    });

    socket.on('close', function(data) {
      console.log('Data: ' + remoteClient);
    });

  }).listen(PORT);
};

getDevice();
