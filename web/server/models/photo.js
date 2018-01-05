const mongoose = require('mongoose'),
      Schema = mongoose.Schema;
/*
 |--------------------------------------------------------------------------
 | Photo schema
 |--------------------------------------------------------------------------
*/

// IF THIS CHANGES, DO UPDATE libs/validation.js!!
const PhotoSchema = new Schema({
  driveID: {
    type: String,
    required: true
  },
  bucketID: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Photo', PhotoSchema);
