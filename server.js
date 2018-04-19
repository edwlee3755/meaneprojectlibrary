var express = require('express');
var app = express();
var port = process.env.PORT || 8080; // use 8080 port or if environment deploying to has specific server it requires, use that instead
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); // parses data in json
var router = express.Router();
var appRoutes = require('./app/routes/api')(router); // (router) use the router object with this route file (our backend routes)
var path = require('path');

//test multer
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '/app/test');
    },
    filename: function(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
            var err = new Error();
            err.code = 'filetype';
            return cb(err);
        } else {
            cb(null, file.originalname);
        }
    }
});
var upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }
}).single('postImg');

//end test multer

// app.use order matters for which middleware will run first (ie. we need to parse the data before we can use the routes)
app.use(morgan('dev')); // prints requests on console for viewing
app.use(bodyParser.json({ limit: "50mb" })); // for parsing application/json content type
app.use(bodyParser.urlencoded({extended: true, limit: "50mb", parameterLimit: 5000000})); // for parsing application/x-www-form-urlencoded
app.use(express.static(__dirname + '/public')); // frontend will have access to all files in public folder. // we use /public as the root directory
app.use('/api', appRoutes); // add '/api' to our backend routes so they don't conflict with our frontend routes if they share the same route

mongoose.connect('mongodb://localhost:27017/meaneprojectlibrary', function(err){
//mongoose.connect('mongodb://edward:edward@ds247449.mlab.com:47449/heroku_1n940bvv', function(err){  // subbed in for mlab database hosting
  //if err connecting to database print error
  if (err) {
    console.log('Not connected to the database: ' + err);
  }
  else {
    console.log('Successfully connected to MongoDB');
  }
});
/* multer test
app.post('/upload', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
              res.json({ success: false, message: 'File size is too large. Max limit is 10MB' });
          } else if (err.code === 'filetype') {
              res.json({ success: false, message: 'File type is invalid. Must be .png, .jpeg or .jpg' });
          } else {
              console.log(err);
              res.json({ success: false, message: 'File was not able to be uploaded' });
          }
        } else {
            if (!req.file) {
                res.json({ success: false, message: 'No file was selected' });
            } else {
                res.jeson({ success: true, message: 'File was uploaded!' });
            }
        }
    });
});
*/

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(port, function(){
  console.log('Running server on port ' + port);
});
