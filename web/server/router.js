const PhotoController = require('./controllers/photos'),
      ErrorController = require('./controllers/error'),
      express = require('express'),
      config = require('config'),
      path = require('path');


module.exports = (app) => {
  // route groups
  const apiRoutes  = express.Router(),
        photosRoutes = express.Router();
  // Set auth and survey routes as subgroup to apiRoutes
  // apiRoutes.use('/auth', authRoutes);
  apiRoutes.use('/photos', photosRoutes);

  // Set a common fallback for /api/*; 404 for invalid route

  apiRoutes.all('*', ErrorController.error);


  /*
  |--------------------------------------------------------------------------
  | Photo routes
  |--------------------------------------------------------------------------
  */
  photosRoutes.get('/', PhotoController.deltaFiles);

  photosRoutes.get('/list', PhotoController.getPhotos);

  photosRoutes.get('/folders', PhotoController.getFolders);
  photosRoutes.get('/photos:id', PhotoController.getPhotosForFolder);




app.use('/api', apiRoutes);

};
