var fs           = require("fs");
var response     = fs.readFileSync("response.json");
var request      = fs.readFileSync("request.json");
var responseContent = JSON.parse(response);

var jsonfile = require('jsonfile');
var file = 'response.json';

var voiceCommand = responseContent.results[0].alternatives[0].transcript;

console.log(voiceCommand + '\n\n');

fs.renameSync('response.json', 'responseTemp.json');
fs.appendFileSync('response.json', '');

fs.renameSync('request.json', 'requestTemp.json');
fs.appendFileSync('request.json', '');

var obj = {
  "config": {
    "encoding":"FLAC",
    "sampleRateHertz":16000,
    "profanityFilter": true,
    "languageCode": "en-US",
    "speechContexts": {
      "phrases": ['']
    },
    "maxAlternatives": 1
  },
  "audio": {
    "content": ""
	}
}

//console.log(obj);
 
jsonfile.writeFile(file, obj, {flag: 'a'}, function (err) {
  console.error(err)
})