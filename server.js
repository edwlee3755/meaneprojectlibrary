var express = require('express');
var app = express();
var port = process.env.PORT || 8080; // use 8080 port or if environment deploying to has specific server it requires, use that instead
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); // parses data in json
var router = express.Router();
var appRoutes = require('./app/routes/api')(router); // (router) use the router object with this route file (our backend routes)
var path = require('path');

// app.use order matters for which middleware will run first (ie. we need to parse the data before we can use the routes)
app.use(morgan('dev')); // prints requests on console for viewing
app.use(bodyParser.json()); // for parsing application/json content type
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(express.static(__dirname + '/public')); // frontend will have access to all files in public folder
app.use('/api', appRoutes); // add '/api' to our backend routes so they don't conflict with our frontend routes if they share the same route

mongoose.connect('mongodb://localhost:27017/meaneprojectlibrary', function(err){
  //if err connecting to database print error
  if (err) {
    console.log('Not connected to the database: ' + err);
  }
  else {
    console.log('Successfully connected to MongoDB');
  }
});

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(port, function(){
  console.log('Running server on port ' + port);
});
