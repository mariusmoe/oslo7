"use strict";

const status = require('../status'),
      Photo  = require('../models/photo'),
      gDrive = require('../libs/googleDrive'),
      path      = require('path');


const rootFolderId  = '0Bzd-8gMv1MGANlhiQ2c1RmZkVXM';   // Root folder to begin search
const secretKeyPem  = path.normalize('./config/your-key-file.pem');  // Access codes for creating tokens

let folderId = 465789    // Depricated ?
let parentString = "?q='"+rootFolderId+"'+in+parents";   // search param to get parent

// Options to use when retriving data from google drive
let driveReq = {
  encoding: null,   // To handle binary data, this need to be set
  url: "",
  //q: 'parents in "0Bzd-8gMv1MGAbnhmODE0aVFyUWs"', // q is to be set in a request
  jwt: {
    // use the email address of the service account, as seen in the API console
    // melodic-voice-110507@appspot.gserviceaccount.com
    // email: '370835289615-compute@developer.gserviceaccount.com',
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

const retriveFolderStructure = ((folderId, driveReq) => {
  return new Promise ((resolve,reject) => {
    gDrive.getListOfFilesWithParents(folderId, driveReq).then((searchedFolders) => {
      let files         =  searchedFolders[0],
          allFolders    =  searchedFolders[1]
      let fullPathAll   = []
      files.forEach((file) => {
        // console.log(folder);
        // TODO filepathe might need stat .png/.jpg
        let filePath = [file.name]
        if (undefined != file['parents']) {
          let _folder = allFolders.find((i) => { return i.id == file.parents[0]})
          // console.log(_folder);
          while (_folder) {
            if ( _folder.id == folderId) {
              break;
            }
            filePath.push(_folder.name)
            // console.log(filePath);

            _folder = allFolders.find((i) => {return i.id == _folder.parents[0]})
          }
          fullPathAll.push(filePath.reverse().join('/'));
        } else {
          fullPathAll.push(filePath[0]);
        }
      })
      resolve([fullPathAll, files])
    })
  })
})

const retriveMongoFiles = new Promise ((resolve,reject) => {
  Photo.find({}, (err, photos) => {
    if (err) { reject(err); }
    resolve(photos);
  })
});

// GET
exports.deltaFiles = (req, res, next) => {

// get google files
Promise.all([retriveMongoFiles, retriveFolderStructure(rootFolderId, driveReq)]).then(filenames => {
  let serverFiles     = filenames[0]
  let googleFiles     = filenames[1][0]
  let googleFilesIDs  = filenames[1][1]



  console.log(serverFiles);
  console.log('-------------------------------------------------------------');
  console.log('All files on google Drive:');
  console.log(googleFiles);
  console.log('-------------------------------------------------------------');

  console.log('Files on google drive that are not on local server:');
  console.log(googleFiles.difference(serverFiles));
  console.log('-------------------------------------------------------------');
  console.log('Files on the server that are not on google drive:');
  console.log(serverFiles.difference(googleFiles));

  let filepathWithNameToId = []
  googleFiles.forEach((file, i) => {
    filepathWithNameToId.push({id: googleFilesIDs[i].id, pathName: file})
  })
  console.log(filepathWithNameToId);

  const filesOnDriveNotOnLocalServer = googleFiles.difference(serverFiles)
  return res.status(200).send({ feedData: 'yay' });


}).catch(function (reason) {
     console.log("Promise Rejected");
     console.log(reason);
});
// get current files on s3 from local db
//
// compare and get delta
//
// upload delta to s3
//
// update local db


}
