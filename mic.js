var Mic = require('mic');
var Transform = require('stream').Transform;
var net = require('net');
var shell = require('shelljs')

var PORT = 52280;
var RATE = 44100;
var CHANNELS = process.env.CHANNELS || 2;
var BIT_DEPTH = 16;

var getDevice = function() {
  if(process.env.MICROPHONE) {
    configureMic(process.env.MICROPHONE);
    return;
  } else {
    configureMic('stereo_capture');
  }

  /*
  parseOutput = function(code, stdout, stderror) {
    console.log('Parsing ' + stdout);

    try {
      var usbLine = stdout.split('\n').find(function(line) { return line.indexOf('USB') > -1 });
      var hardwareRegex = /card (\d).*device (\d)/;
      var match = hardwareRegex.exec(usbLine);

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
      parseOutput(0, result, '');
    } else {
      shell.exec('arecord -l', parseOutput);
    }
  } catch(ex) {
    console.log(ex);

    configureMic('hw:0,0');
  }
  */
};

var configureMic = function(device) {
  console.log('Configuring ' + device);

  var micConfig = {
    'rate': RATE,
    'channels': CHANNELS,
    'device': device
  };

  if(process.env.DEBUG) {
    micConfig.debug = true;
  }

  console.log(micConfig);

  var mic = Mic(micConfig);
  var micInputStream = mic.getAudioStream();
  mic.start();

  net.createServer(function(socket) {
    remoteClient = socket.remoteAddress + ':' + socket.remotePort

    console.log('Connected: ' + remoteClient);

    micInputStream.pipe(socket);

    socket.on('data', function(data) {
      console.log('Data: ' + remoteClient + ':: ' + data);
    });

    socket.on('error', function(error) {
      console.log('error', error);
    });

    socket.on('close', function(data) {
      console.log('Data: ' + remoteClient);
    });

  }).listen(PORT);
}

getDevice();
