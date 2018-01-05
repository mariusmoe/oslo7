"use strict"

const bodyParser = require('body-parser'),
      logger = require('morgan'),
      config = require('config'),
      helmet = require('helmet'),
      methodOverride = require('method-override');

module.exports = app => {

  // Pretty print
  app.set("json spaces", 4);

  // Secure app with helmet, less xss
  app.use(helmet());

  // Set port number
  app.set('port', 2000);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Log requests to API using morgan
  // :method :url :status :response-time ms - :res[content-length]
  // app.use(logger('dev'));
//   if(config.NODE_ENV !== 'test') {
//     //use morgan to log at command line
//     app.use(logger('dev')); //'combined' outputs the Apache style LOGs
// }

if(config.util.getEnv('NODE_ENV') !== 'test') {
    //use morgan to log at command line
    app.use(logger('dev')); //'combined' outputs the Apache style LOGs
}

  // Enable CORS from client-side
  app.use(function(req, res, next) {
    let allowedOrigins = [
      'http://localhost:4200',
      'http://localhost:4321',
      'http://localhost:2000',
      ];
          let origin = req.headers.origin;

    if(allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // res.header("Access-Control-Allow-Origin", ["http://localhost:4200", "http://localhost:4321"]);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, PATCH, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  app.use(methodOverride())
  app.use(function (err, req, res, next) {
    return res.status(404).send({ error: 'Something failed!' })
  })
};
