var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); 
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data

app.set('view engine', 'hjs');

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/users';

var db;

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, database) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {

    console.log('Connection established to', url);

    // do some work here with the database.
	db = database;
	
    //Close connection
  }
});

app.post('/create_user', function(req, res) {
	console.log(req.body.username);
});

app.get('/', function(req, res) {
	res.render('index', {
		heading: 'Franz'
	});
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});