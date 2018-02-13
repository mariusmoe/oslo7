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
    type: String
  },
  bucketID: {
    type: String
  },
  name: {
    type: String
  },
  mimeType: {
    type: String
  },
  parents: {
    type: String
  }
});

module.exports = mongoose.model('Photo', PhotoSchema);
