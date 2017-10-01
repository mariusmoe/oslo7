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
    // directories with these keys will be skipped
  , filters: ["Temp", "_Temp", "node_modules", "arboreal"]
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
        console.log('***************************************************');
        console.log(driveFiles);
        console.log(folderIDAtPath);
        console.log(folderNameAtPath);

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
_peekFolder(rootFolderId, driveReq, 'root').then((_fullPathList) => {
  console.log('+++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++');
  console.log(_fullPathList);
  console.log('+++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++');
});
let tree = new oak.Tree('CEO');

// tree.add('VP of Happiness', 'CEO', tree.traverseDF);
// tree.add('VP of Finance', 'CEO', tree.traverseDF);
// tree.add('VP of Sadness', 'CEO', tree.traverseDF);
//
// tree.add('Director of Puppies', 'VP of Finance', tree.traverseDF);
// tree.add('Manager of Puppies', 'VP of Finance', tree.traverseDF);
//
// tree.traverseDF(function(node) {
//     console.log(node.data)
// });
// console.log('+++++++++++++++++++++++++');
// tree.leafNodeNames(function(node) {
//   console.log(node);
//   console.log('\n');
// });

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
/*
Promise.all([getListFromFileSystem]).then(filenames => {
  let serverFiles  = filenames[0]
  console.log('-----------------');
  console.log(serverFiles);

  // Download missing files


}).catch(function (reason) {
     console.log("Promise Rejected");
     console.log(reason);
});;
*/
