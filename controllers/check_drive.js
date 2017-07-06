var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var key = require('/path/to/key.json');
var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  [scope1, scope2],
  null
);

jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  }

  // Make an authorized request to list Drive files.
  drive.files.list({
    auth: jwtClient
  }, function (err, resp) {
    // handle err and response
  });
});
