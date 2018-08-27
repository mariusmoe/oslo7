const mongoose = require('mongoose'),
      Schema = mongoose.Schema;
/*
 |--------------------------------------------------------------------------
 | Photo schema
 |--------------------------------------------------------------------------
*/

// IF THIS CHANGES, DO UPDATE libs/validation.js!!
const photoSchema = new Schema({
  driveID: String,
  bucketID: String,
  name: String,
  mimeType: String,
  parents: String
});

module.exports = mongoose.model('Photo', photoSchema);
