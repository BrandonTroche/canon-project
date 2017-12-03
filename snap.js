/* user modules */
const Camera = require('howielib').MMCamera;
const logger = require('howielib').Logger;
var fs       = require("fs");

logger.setLevel('normal');
const camera = new Camera();

var camUUID = '00000000-0000-0000-FFFF-A0CC2B5F90F4';

// connect to the camera using PTP-IP
camera.ipConnect((responseCode) => {

  if (responseCode !== 'OK') {
    logger.red('connection problem: ' + responseCode);
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
    
//    camera.getLastImage()
//            .then((response) => {
//
//            // get the first and only item in the response array
//            let lastItem = response[0];
//            logger.green('got image');
//
//            // print the information about the image
//            logger.dir(lastItem.info);
//
//            // save the image
//            let filename = 'img/last-img.jpg';
//            fs.writeFileSync(filename, lastItem.image, {encoding: 'binary'});
//            logger.green('saved image to ' + filename);
//
//            process.exit(0);
//
//        })
//            .catch((error) => {
//
//            logger.red('got error: ');
//            logger.red(error);
//
//        });

}, {uuid: camUUID});


//console.log("NODE :: snap\n");