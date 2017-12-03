var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var morgan       = require('morgan');
const MMCamera   = require('howielib').MMCamera;
const logger     = require('howielib').Logger;
var request      = require('request');
var routes       = require('./routes/routes.js');

function onConnect(responseCode){
    if (responseCode !== 'OK'){
        console.log('problem connecting: ' + responseCode);
        return;
    }
    
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

var port = process.env.PORT || 3340;

var urlencodedParser = bodyParser.urlencoded({extended:false});

app.use('/assets', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

//let cam = new MMCamera();

//wifiSettings(cam);

//var camUUID = '00000000-0000-0000-FFFF-A0CC2B5F90F4';
//
//cam.ipConnect(onConnect, {uuid: camUUID});
//
//logger.setLevel('normal');
//
//snapping(cam);
//getPic(cam);

require('./routes/routes.js');



//console.log(request.post('https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyAOLU6UlhZadXjQVag5IqucvxeQV287LT4'))

routes(app);

app.listen(port);
//POST https://speech.googleapis.com/v1/speech:recognize?key=YOUR_API_KEY

