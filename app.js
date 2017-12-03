var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var morgan       = require('morgan');
const MMCamera   = require('howielib').MMCamera;
const logger     = require('howielib').Logger;
var request      = require('request');
var routes       = require('./routes/routes.js');
var fs           = require("fs");
var response     = fs.readFileSync("speech/response.json");
var responseContent = JSON.parse(response);
const P          = require('bluebird');
let exec         = require('child_process').exec;

let IMG_COUNT = 10;
let INTERVAL_MS = 300;
let FULL_SIZE = false;

function onConnect(responseCode){
    if (responseCode !== 'OK'){
        console.log('problem connecting: ' + responseCode);
        return;
    }
    
//    snapping(cam);
    
}

function wifiSettings(camera){
    let essid = 'ImpactHubNYC_Guests';//'ImpactHubNYC_MakeSchool'; //'ImpactHubNYC_Members_5Ghz';
    let passphrase = 'whynotjoin?';//'PiedPiper2016';//'FiveCities';

    if (essid === undefined || passphrase === undefined) {
        logger.red('plase specify an essid and passphrase as args, e.g.:');
        logger.cyan('\tnode set-wifi-settings <YourNetworkName> <YourNetworkPassword>');
        process.exit(0);
    }

    // connect to the camera 
    camera.ipConnect((responseCode) => {

        if (responseCode !== 'OK') {
            logger.red('connection problem: ' + responseCode);
            process.exit(0);
        }

        // set the wireless settings for the next PTP-IP session
        camera.setWirelessSettings(essid, passphrase)
            .then((response) => {

            logger.green('got response');
            logger.dir(response);
//            console.log(camera.getUUID());
            return camera.close();

        })
            .then((response) => {
            logger.green('session closed');
            logger.dir(response);
            process.exit(0);

        })
            .catch((error) => {

            logger.red('got error: ');
            logger.red(error);

        });

    });
}

function snapping(camera){
    // connect to the camera using PTP-IP
    camera.ipConnect((responseCode) => {

        if (responseCode !== 'OK') {
            logger.red('connection problem: ' + responseCode);
            process.exit(0);
        }

        // ask the camera to snap a photo
        camera.snap()
            .then((response) => {

            console.dir(response);
            logger.green('snap done. exiting.');

            process.exit(0);

        })
            .catch((error) => {

            logger.red('got error: ');
            logger.red(error);

        });

    });
}

function getPic(camera){
    camera.ipConnect((responseCode) => {

  if (responseCode !== 'OK') {
    logger.red('connection problem: ' + responseCode);
    process.exit(0);
  }

  // ask the camera for the last image
  camera.getLastImage()
  .then((response) => {

    // get the first and only item in the response array
    let lastItem = response[0];
    logger.green('got image');

    // print the information about the image
    logger.dir(lastItem.info);

    // save the image
    let filename = 'img/last-img.jpg';
    fs.writeFileSync(filename, lastItem.image, {encoding: 'binary'});
    logger.green('saved image to ' + filename);

    process.exit(0);

  })
  .catch((error) => {

    logger.red('got error: ');
    logger.red(error);

  });

});
}

app.use(morgan('dev')); // log every request to the console

//var port = process.env.PORT || 3340;

//var urlencodedParser = bodyParser.urlencoded({extended:false});

//app.use('/assets', express.static(__dirname + '/public'));

//app.set('view engine', 'ejs');

logger.setLevel('normal');

let cam = new MMCamera();

//wifiSettings(cam);

//var camUUID = '00000000-0000-0000-FFFF-A0CC2B5F90F4';

//cam.ipConnect(onConnect, {uuid: camUUID});

//require('./routes/routes.js');

//console.log(request.post('https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyAOLU6UlhZadXjQVag5IqucvxeQV287LT4'))

//routes(app);

var voiceCommand = responseContent.results[0].alternatives[0].transcript;

console.log(voiceCommand);

if (voiceCommand == 'snap'){
    cam.ipConnect((responseCode) => {

        if (responseCode !== 'OK') {
            logger.red('connection problem: ' + responseCode);
            process.exit(0);
        }

        // ask the camera to snap a photo
        cam.snap()
            .then((response) => {

            console.dir(response);
            logger.green('snap done. exiting.');

//            process.exit(0);

        })
            .catch((error) => {

            logger.red('got error: ');
            logger.red(error);

        });
    
        
        cam.getLastImage()
            .then((response) => {

            // get the first and only item in the response array
            let lastItem = response[0];
            logger.green('got image');

            // print the information about the image
            logger.dir(lastItem.info);

            // save the image
            let filename = 'img/last-img.jpg';
            fs.writeFileSync(filename, lastItem.image, {encoding: 'binary'});
            logger.green('saved image to ' + filename);

            process.exit(0);

        })
            .catch((error) => {

            logger.red('got error: ');
            logger.red(error);

        });

    });
} else if (voiceCommand == 'shoot'){
    const options = process.argv.slice(2).reduce((acc, arg) => {

    let [k, v = true] = arg.split('=');
    switch (k) {

      case 'frames':
        v = parseInt(v);
        if (typeof v === 'number' && v < 20 && v > 0) {
          IMG_COUNT = v;
        } 
        break;
      case 'interval':
        v = parseInt(v);
        if (typeof v === 'number' && v > 500) {
          INTERVAL_MS = v;
        }
        break;
    }

    acc[k] = v;
    return acc;

}, {})

if (options.debug === 'true') {
  logger.setLevel('debug');
}

if (options.size !== undefined && options.size === 'full') {
  FULL_SIZE = true;
}


let imgCounter = 0;
let imageFiles = [];


// connect to the camera using PTP-IP
cam.ipConnect((responseCode) => {
  if (responseCode === 'OK') {
    gifLoop();
  } else {
    logger.red('Problem connecting: ' + responseCode);
    process.exit(0);
  }

});


function gifLoop() {

  if (imgCounter < IMG_COUNT) {

    cam.snap()
    .then((response) => {

      logger.green('snapped img ' + imgCounter);
      imgCounter++;

      setTimeout(function() {
        gifLoop();
      }, INTERVAL_MS);

    })
    .catch((error) => {
      logger.red('snap error: ');
      logger.red(error);
    });

  } else {

    let objects;
		if (FULL_SIZE) {
			objects = cam.getLastImage(IMG_COUNT);
    } else {
			objects = cam.getLastThumb(IMG_COUNT);
    }

    objects.then((response) => {

      logger.green('got ' + response.length + ' thumbs');

      for (let i = 0; i < response.length; i++) {

        let filename = 'gif/gif-img-' + i + '.jpg';

        let obj = response[i].image;

        fs.writeFileSync(filename, obj, {encoding: 'binary'});

        logger.green('saved ' + filename);
        imageFiles[i] = filename;
      }

      // generate gif
      generateGif(imageFiles);

    })
    .catch((error) => {
      logger.red('getLastImage error');
      logger.red(error);
    });

  }

}

function generateGif(files) {

  logger.cyan('generating gif...');
  console.dir(options);

  let inputString = (() => {
    let str = '';
    for (let name of files) {
      str += (name + ' ');
    }
    return str;
  })();

  let convert = exec('convert -loop 0 -delay ' + (INTERVAL_MS/10) + ' ' + inputString + 'gif/img.gif');

  convert.stdout.on('data', data => {
    console.log( `convert: ${data}` );
  });

  convert.stderr.on('data', data => {
    console.log( `convert: ${data}` );
  });

  convert.on('close', code => {
    logger.cyan( 'convert exited with code ' + code );
    if (code === 0) {
      logger.green('done');
      exec('qlmanage -p gif/img.gif >& /dev/null');
    } else {
      logger.red('ImageMagick had a problem');
      logger.red('Ensure it is installed on your machine');
    }
		process.exit(0);
  });

}

}

//app.listen(port);

//POST https://speech.googleapis.com/v1/speech:recognize?key=YOUR_API_KEY

