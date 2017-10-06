const gDrive = require('./libs/googleDrive');
const oak = require('./libs/oak-tree');
const walk    = require('walk');
const fs      = require('fs');
const path      = require('path');

const rootFolderId  = '0Bzd-8gMv1MGANlhiQ2c1RmZkVXM';
const secretKeyPem      = path.normalize('../scripts/config/your-key-file.pem');

let folderId = 465789
let parentString = "?q='"+rootFolderId+"'+in+parents";
// Options to use when retriving data from google drive
let driveReq = {
  url: "",
  //q: 'parents in "0Bzd-8gMv1MGAbnhmODE0aVFyUWs"',
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

// Walker options
const walkerOptions = {
    followLinks: false   // We do not want this
    // directories with these keys will be skipped (obviously not in windows)
  , filters: ["Temp", "_Temp", "node_modules", "arboreal", ".git"]
};

let fullPathList  = [];
let folderQueue   = [];
// Create list of files on googleDrive
const _peekFolder = ((folderId, driveReq, level) => {
  return new Promise ((resolve,reject) => {
    const peekFolder = ((folderId, driveReq, level) => {
      gDrive.getContent(folderId, driveReq).then((driveReqResult) => {
        let driveFiles   =  driveReqResult[0],
        folderIDAtPath    =  driveReqResult[1],
        folderNameAtPath  =  driveReqResult[2];

        // Add file to fullpath with its full path
        driveFiles.forEach((_file, i) => {
          fullPathList.push(level + '/' +_file);
        })
        folderIDAtPath.forEach((_folderId, i) => {
          peekFolder(_folderId, driveReq, level + '/' + folderNameAtPath[i])
        })

        if (folderIDAtPath.length === 0) {
          resolve(fullPathList);
        }
      })
    })
    peekFolder(rootFolderId, driveReq, level);
  })
})

console.log('+++++++++++++++++++++++++');

// Walk the file structure to see wiche files is already stored localy
let getListFromFileSystem = new Promise ((resolve,reject) => {
  // A set with all files found on the server
  let serverFiles = []
  // let serverFiles = new buckets.BSTree();

  // Walker options
  options = {
    followLinks: false   // We do not want this
    // directories with these keys will be skipped
  , filters: ["Temp", "_Temp", "node_modules", "arboreal"]
  };
  // Defines walker - Defines where to start walking from
  let walker  = walk.walk('../', options);
  // Start walking
  walker.on('file', (root, stat, next) => {
      // "root" is the filepathe so far
      // Add this file to the list of files
      serverFiles.push(root + '/' + stat.name);
      next();
  });
  // Stop walking
  walker.on('end', () => {resolve(serverFiles);} );
})

// Wait until google request and local file check is compleate
// Promise.all([getListFromFileSystem, _peekFolder(rootFolderId, driveReq, 'root')]).then(filenames => {
//   let serverFiles  = filenames[0]
//   let googleFiles  = filenames[1]
//   console.log('-----------------');
//   console.log(serverFiles);
//   console.log('-----------------');
//   console.log(googleFiles);
//
//   // Download missing files
//
// }).catch(function (reason) {
//      console.log("Promise Rejected");
//      console.log(reason);
// });;


// var http = require('http');


var file = fs.createWriteStream("file.txt");
// var request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
//   response.pipe(file);
// });
const request = require('google-oauth-jwt').requestWithJWT();
var f=fs.createWriteStream('name.jpeg');
let testImage = '0Bzd-8gMv1MGAdVJhWEVfaTZJTUk'
driveReq.url = "https://www.googleapis.com/drive/v3/files/" + testImage + "?alt=media"
  // request.get( driveReq, (err, res, body) => {
  //   console.log(res);
  //   console.log('-----------------------------------------------------');
  //   console.log(body);
  //   console.log(res.statusCode) // 200
  //   console.log(res.headers['content-type'])
  //   console.log(res.headers.size);
  //   res.pipe(file);
  //   console.log('Done!');
  //   fs.writeFile('myfile.jpg', res.body, function (err) {
  //    // Handle err somehow
  //    // Do other work necessary to finish the request
  //  })
  // })

  request.get(driveReq, function (err, res, body) {

  });
