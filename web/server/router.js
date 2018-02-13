const PhotoController = require('./controllers/photos'),
      FeedController = require('./controllers/feed'),
      ErrorController = require('./controllers/error'),
      express = require('express'),
      config = require('config'),
      path = require('path');


module.exports = (app) => {
  // route groups
  const apiRoutes  = express.Router(),
        feedRoutes = express.Router(),
        angularRoutes = express.Router(),
        photosRoutes = express.Router();
  // Set auth and survey routes as subgroup to apiRoutes
  // apiRoutes.use('/auth', authRoutes);
  apiRoutes.use('/feed', feedRoutes);
  apiRoutes.use('/photos', photosRoutes);

  // Set a common fallback for /api/*; 404 for invalid route

  apiRoutes.all('*', ErrorController.error);
  /*
   |--------------------------------------------------------------------------
   | Survey routes
   |--------------------------------------------------------------------------
  */
  feedRoutes.get('/', FeedController.getFeed);

  /*
  |--------------------------------------------------------------------------
  | Photo routes
  |--------------------------------------------------------------------------
  */
  photosRoutes.get('/', PhotoController.deltaFiles);

  photosRoutes.get('/list', PhotoController.getPhotos);


  // retrive one survey as a json object
  // surveyRoutes.get('/:json/:surveyId', SurveyController.getSurveyAsJson);
    angularRoutes.get('/', (req, res) => {
      res.sendFile(path.join(__dirname + '../client_viten/dist/index.html'));
  });
app.use('/api', apiRoutes);
app.use('/', angularRoutes);
};
