const express = require('express'),
      consign = require('consign'),
      app = express(),
      mongoose = require('mongoose'),
      path = require('path');

// Use ES 6 promise instead of depricated mpromise
mongoose.Promise = Promise;

consign()
      .include('models')
      .then('libs/setup.js')
      .then('controllers')
      .then('router.js')
      .then('libs/boot.js')
      .into(app);

  module.exports = app;
