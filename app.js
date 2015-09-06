var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); 
var app = express();

var bCrypt = require('bcryptjs');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data
app.use(express.static('public'));

app.set('view engine', 'hjs');


var mongoose = require('mongoose');

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/users';

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

// Use connect method to connect to the Server
mongoose.connect(url, function (err, database) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } 
});

User = require('./user_model');

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var LocalStrategy = require('passport-local')


// passport/login.js
passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    User.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                //req.flash('message', 'User Not found.'));                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return done(null, false
              //req.flash('message', 'Invalid Password')
			  );
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        return done(null, user);
      }
    );
}));

// Generates hash using bCrypt
var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false
             //req.flash('message','User Already Exists')
			 );
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);
          
          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);

/* Handle Registration POST */
  app.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash : true
  }));
  
app.post('/signup', passport.authenticate('signup', {
	successRedirect: '/home',
	failureRedirect: '/',
	failureFlash : true
}));


/* Handle Logout */
app.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/', function(req, res) {
	res.render('index', {
		heading: (req.user ? req.user.username : 'Franz')
	});
});

app.get('/home', function (req, res) {
  res.render('home', {});
});

app.get('/profile', function (req, res) {
  res.render('profile', {
    name: (req.user ? req.user.username : 'no name')
  })
});

app.post('/search', function(req, res){
	User.findOne({ 'username' :  req.user.username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);

        if (user){
			res.send(user); 
		return done(null, user);				
	  }}
	  
)});

app.get('/addfriends', function(req, res){
	res.render('addfriends', {});
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});