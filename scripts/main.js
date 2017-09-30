const fo = require('./libs/googleDrive');
const oak = require('./libs/oak-tree');
const walk    = require('walk');
const fs      = require('fs');

const rootFolderId = '0Bzd-8gMv1MGANlhiQ2c1RmZkVXM';
const folderMIME = 'application/vnd.google-apps.folder';

let folderId = 465789
let parentString = "?q='"+folderId+"'+in+parents";
// Options to use when retriving data from google drive
let driveReq = {
  url: "https://www.googleapis.com/drive/v3/files"+parentString,
  //q: 'parents in "0Bzd-8gMv1MGAbnhmODE0aVFyUWs"',
  jwt: {
    // use the email address of the service account, as seen in the API console
    // melodic-voice-110507@appspot.gserviceaccount.com
    // email: '370835289615-compute@developer.gserviceaccount.com',
    email: 'melodic-voice-110507@appspot.gserviceaccount.com',
    // use the PEM file we generated from the downloaded key
    keyFile: '../config/your-key-file.pem',
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

// Create list of files on googleDrive

let _driveFiles, folderIDAtPath = fo.getContent(rootFolderId, driveReq, folderMIME)

console.log(_driveFiles);
console.log(folderIDAtPath);


let tree = new oak.Tree('CEO');

tree.add('VP of Happiness', 'CEO', tree.traverseDF);
tree.add('VP of Finance', 'CEO', tree.traverseDF);
tree.add('VP of Sadness', 'CEO', tree.traverseDF);

tree.add('Director of Puppies', 'VP of Finance', tree.traverseDF);
tree.add('Manager of Puppies', 'VP of Finance', tree.traverseDF);

tree.traverseDF(function(node) {
    console.log(node.data)
});
console.log('+++++++++++++++++++++++++');
tree.leafNodeNames(function(node) {
  console.log(node);
  console.log('\n');
});

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
Promise.all([getListFromFileSystem]).then(filenames => {
  let serverFiles  = filenames[0]
  console.log('-----------------');
  console.log(serverFiles);

  // Download missing files


}).catch(function (reason) {
     console.log("Promise Rejected");
     console.log(reason);
});;
