"use strict";

const status = require('../status'),
      Photo  = require('../models/photo'),
      gDrive = require('../libs/googleDrive'),
      config = require('config'),
      path   = require('path'),
      async  = require("async");

const request = require('google-oauth-jwt').requestWithJWT();

var AWS = require('aws-sdk');

AWS.config.accessKeyId = config.aws_key;
AWS.config.secretAccessKey = config.aws_secret_key;

var s3 = new AWS.S3();
const MAX_CONCURRENT_AWS_UPLOADS = 3;

const rootFolderId  = '0Bzd-8gMv1MGANlhiQ2c1RmZkVXM';   // Root folder to begin search
const secretKeyPem  = path.normalize('./config/your-key-file.pem');  // Access codes for creating tokens

let folderId = 465789    // Depricated ?
//let parentString = "?q='"+rootFolderId+"'+in+parents";   // search param to get parent

// Options to use when retriving data from google drive
let driveReq = {
  encoding: null,   // To handle binary data, this need to be set
  url: "",
  //q: // q is to be set in a request
  jwt: {
    email: 'melodic-voice-110507@appspot.gserviceaccount.com',
    // use the PEM file we generated from the downloaded key
    keyFile: secretKeyPem,
    // specify the scopes you wish to access - each application has different scopes
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  }
}

// Return the difference between two lists
Array.prototype.difference = function(a) {
  return this.filter((i) => {return a.indexOf(i) < 0;});
};


const retriveMongoFiles = (() => {
  return new Promise ((resolve,reject) => {
    Photo.find({}, (err, photos) => {
      if (err) { reject(err); }
      resolve(photos);
    })
  });
})

/*
TODO: OR not handeled
* New location for file - DONE
* Already in db - DONE
* Delete file
 */

// GET
exports.deltaFiles = (req, res, next) => {
// get google files
Promise.all([retriveMongoFiles(), gDrive.getListOfFiles(rootFolderId, driveReq)]).then(filenames => {
  console.log('SEARCHED FOLDERS:');
  let serverFiles         = filenames[0]
  let googleFilesObject   = filenames[1]
  /*
    ---- START -> Find delta files ----
   */
  // earlier solution  -  O(n+n+n^2+p), p <= n.
  let folderChanged = [];
  let filesOnDriveNotOnLocalServerObjects = [];
  // if serverFiles.length ~ googleFilesObject.length and the find function
  // returns a worst case every time we could have: O(n^2), which is not ideal...
  googleFilesObject.forEach((object) => {
    let foundEntry;
    foundEntry = serverFiles.find((i) => {return i.driveID == object.id});
    if (foundEntry          != null &&
        object.parents      != null &&
        foundEntry.parents  != object.parents[0]) {
          console.log('SUCCESS!');
          // folderChanged.push(object);
          photos.findOneAndUpdate({driveID: object.id}, {parents: object.parents[0]}, (err, changedLocalObject) => {
            if (err) {
              console.log(err);
            }
          })
    } else {
      if (foundEntry != null){
        console.log('Already in db!');
        
      } else {
        // add to download queue
        filesOnDriveNotOnLocalServerObjects.push(object);
      }
    }
  });
  /*
    ---- END -> Find delta files ----
   */

  /**
   *   ***** START -> Go through every file not on local server ****
   Under here is async image download
   */
  //async.forEachSeries(filesOnDriveNotOnLocalServerObjects, (object, callback) => {
  async.forEachLimit(filesOnDriveNotOnLocalServerObjects, MAX_CONCURRENT_AWS_UPLOADS, (object, callback) => {
  //filesOnDriveNotOnLocalServerObjects.forEach((object) => {
    const googleFile = new Photo({
      driveID: object.id,
      name: object.id,
      mimeType: object.mimeType,
      parents: object.parents ? object.parents[0] : '' //parents
    });
    googleFile.save((err) => {
      if (err) {
        console.log('ERROR during storing in DB');
        return next(err)
      }
    })
    let params = {Bucket: config.aws_s3_bucket_name, Key: object.id, Body: '', ACL: 'public-read'};
    let driveDownloadReq = driveReq;
    driveDownloadReq.url = "https://www.googleapis.com/drive/v3/files/" + object.id + "?alt=media"
    driveDownloadReq.encoding = null;

    if (object.mimeType == 'image/jpeg' || object.mimeType == 'image/png') {
      // Make download request to google drive
      request.get( driveReq, (err, res, body) => {
        if (res.headers['content-type'] == 'image/jpeg' || res.headers['content-type'] == 'image/png') {
          params.Body = body;
          s3.upload(params, function(err, data) {
            if (err) {
              console.log("Error", err);
            } if (data) {
              console.log("Upload Success", data.Location);
            }
            callback();
          });
          console.log('--- UPLOAD IMAGE ----');
        } else {
          if (res.headers['content-type'] == 'application/json; charset=UTF-8') {
            console.log(res.headers['content-type'])
            const fileBuffer = new Buffer(res.body, 'binary' );
            const file2 = fileBuffer.toString('utf8');
            console.log(file2);
          } else {
            console.log('Could not recognize -.-');
          }
          callback();
        }
      })
    } else {
      callback();
    }
  }, (err) => {
    if (err) {
      console.log('Oh no, an error');
    } else {
      console.log('ALL FILES HAS BEEN MIGHTY PROCESSED');
    }
  });

    /*
    ***** END -> Go through every file not on local server ****
    */
    return res.status(200).send({ feedData: 'yay' });
  }).catch(function (reason) {
       console.log("Promise Rejected");
       console.log(reason);
  });

}   // END of giant delta files operation

// GET
exports.getPhotos = (req, res, next) => {
  Photo.find({}, (err, photos) => {
    if (err) {
        return next(err);
    }
    return res.status(200).send(photos);
  });
}

// GET
exports.getFolders = (req, res, next) => {
  console.log('looking up folders...');
  
  Photo.find({ mimeType: 'application/vnd.google-apps.folder'}, (err, folders) => {
    if (err) {
      console.log('could not find', err)
      return res.status(500).send(err);
      
    }
    console.log('Found stuff: ')
    console.log(folders)
    return res.status(200).send(folders);
  }).catch((e) => {
    console.log('could not find')
});
}

// GET
exports.getPhotosForFolder = (req, res, next) => {
  const folder = req.params.id
  Photo.find({parents: folder}, (err, photos) => {
    if (err) {
      return next(err);
    }
    return res.status(200).send(photos);
  });
}


// DELETE
// does not work yet!
exports.deletePhoto = (req, res, next) => {
  const photosToDelete = req.body.toDelete
  Photo.find({}, (err, photos) => {
    if (err) {
      return next(err);
    }
    return res.status(200).send(photos);
  });
  var params = {
    Bucket: 'STRING_VALUE', /* required */
    Delete: { /* required */
      Objects: [ /* required */
        {
          Key: 'STRING_VALUE', /* required */
          VersionId: 'STRING_VALUE'
        },
        /* more items */
      ],
      Quiet: true || false
    },
    MFA: 'STRING_VALUE',
    RequestPayer: requester
  };
  s3.deleteObjects(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
  });


}