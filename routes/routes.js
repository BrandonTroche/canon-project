var parser           = require('body-parser');
var urlencodedParser = parser.urlencoded({extended : false});

var path             = require("path");

module.exports = function(app){
    
 
    app.use('/', function(req, res, next){
        console.log('Request Url: ' + req.url);
        next();
    });

    app.get('/', function(req, res, next){
        res.render('index');
    });
    
    
}