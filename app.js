var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var morgan       = require('morgan');

app.use(morgan('dev')); // log every request to the console

var port = process.env.PORT || 3340;

var urlencodedParser = bodyParser.urlencoded({extended:false});

app.use('/assets', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');


