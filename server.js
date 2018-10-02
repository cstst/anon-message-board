'use strict';

var express       = require('express');
var bodyParser    = require('body-parser');
var expect        = require('chai').expect;
var cors          = require('cors');
const helmet      = require('helmet');
const MongoClient = require('mongodb').MongoClient

const frontEndRoutes  = require('./routes/frontEnd.js')
var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

//For FCC testing purposes only
app.use(cors({origin: '*'})); 

app.use(helmet({
  hidePoweredBy: {
    setTo: 'PHP 4.2.0'
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https://hyperdev.com", "https://cdn.gomix.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://code.jquery.com"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  dnsPrefetchControl: {
    allow: true
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(process.env.DB, (err, db) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Successful database connection');
    
    //For static pages
    frontEndRoutes(app);

    //For FCC testing purposes
    fccTestingRoutes(app);
    
    //For API 
    apiRoutes(app, db);
    
    //404 Not Found Middleware
    app.use((req, res) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
  }  
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
