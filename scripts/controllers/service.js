// obtain a JWT-enabled version of request
const request = require('google-oauth-jwt').requestWithJWT();
const walk    = require('walk');
const fs      = require('fs');
var Set = require('jsclass/src/set').Set;
var buckets = require('buckets-js');
var Arboreal = require("../arboreal/lib/arboreal");
const rootFolderId = '0Bzd-8gMv1MGANlhiQ2c1RmZkVXM';
const folderMIME = 'application/vnd.google-apps.folder';


// Request a list of files shared with this user
// TODO: If there is too many files "incompleteSearch:" will eval to true
//       If this happens more results must be fetched
//       ALTERNATIVELY - sort the result on moast reacent files
//                       in other words the 1000 moast reacent changed files
let getListFromDrive = new Promise ( (resolve, reject) => {

  let searchDrive = (folderID, mimeType, callback) => {
    // return new Promise(function(_resolve, _reject) {
      let parentString = '';
      // console.log('*******************\nfolderID: '+folderID+'\nmimeType: '+ mimeType);
      if (folderID != null){
        parentString = "?q='"+folderID+"'+in+parents";
      }
      // console.log(parentString);
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
      request( driveReq, (err, res, body) => {
        if (err){ console.error(err); }

        let folderIDAtPath = [];
        let folderNameAtPath = [];
        let _driveFiles =[];
        // console.log(body);
        // Parse response
        let parsedBody = JSON.parse(body);

        parsedBody.files.forEach((file) => {
          // Interesting mime types: image/jpeg, application/vnd.google-apps.folder
          if (file.mimeType === mimeType){
            folderIDAtPath.push(file.id);
            folderNameAtPath.push(file.name);
          }
          // If the file is anyting but a folder, add it to drive files
          if (file.mimeType != folderMIME){
            _driveFiles.push(file.name);
          }

        });
        callback(_driveFiles, folderIDAtPath, folderNameAtPath);
      })
  }
  let driveFiles = [];
  let driveFilesName = []
  let fileIDToName = new buckets.Dictionary()
  let folderToparent = new buckets.Dictionary()
  let tree = new Arboreal()

  searchDrive(rootFolderId, folderMIME,
             (stat, foldersInRoot, folderNamesInRoot) => {
    // console.log('-----------Search drive compleated once!------------');
    // console.log(folderNamesInRoot);
    // console.log(foldersInRoot);
    // console.log(stat);
    // console.log('----------------------------------------------------');
    stat.forEach((_stat_) => {
      driveFilesName.push('root/'+_stat_);   // Put all actual files in root folder in driveFilesName
    })
    let folders = new buckets.Queue()
    foldersInRoot.forEach((folder, i) => {
      folders.add(folder)
      folderToparent.set(folderNamesInRoot[i], 'root')
      fileIDToName.set(folder, folderNamesInRoot[i]);
    })
    // TODO fix so that filepath have all above folders
    // while (folders.size() > 0) {
    var x = 0;
    var loopArray = function(folders) {
        searchDrive(folders.peek(), folderMIME,function(_stat, _folders, _folderNames){
            if (_stat) {
              _stat.forEach((thisStat, i) => {
                // TODO: Use dictionary to do some magic here
                let fullPath = fileIDToName.get(folders.peek());
                function findAncestor(folderToCheck){
                  if (folderToparent.get(folderToCheck)){
                    fullPath = folderToparent.get(folderToCheck) +'/'+ fullPath;
                    findAncestor(folderToparent.get(folderToCheck));
                  }
                }
                // console.log('*******************************');
                // console.log(fileIDToName.get(folders.peek()));
                findAncestor(fileIDToName.get(folders.peek()));
                // console.log(fullPath);
                driveFilesName.push(fullPath+'/'+thisStat);});
                // driveFilesName.push(fileIDToName.get(folders.peek())+'/'+thisStat);});
            }
            if (_folders) {
              _folders.forEach((folder, i) => {
                folders.add(folder);
                fileIDToName.set(folder, _folderNames[i]);
                folderToparent.set(_folderNames[i], fileIDToName.get(folders.peek()));
              });
            }
            // set x to next item
            folders.dequeue();
            // console.log('dequeue!!!');
            // console.log('names'+ driveFilesName);

            // any more items in array? continue loop
            if(folders.size() != 0) {
                loopArray(folders);
            } else {
              // console.log(folderToparent.forEach((key,value) => {console.log(key, value);}));
              resolve(driveFilesName)
            }
        });
    }
    loopArray(folders);
  });
});


// Walk the file structure to see wiche files is already stored localy
let getListFromFileSystem = new Promise ((resolve,reject) => {
  // A set with all files found on the server
  let serverFiles = new Set([]);
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
      serverFiles.add(root + '/' + stat.name);
      next();
  });
  // Stop walking
  walker.on('end', () => {resolve(serverFiles);} );
})

// Wait until google request and local file check is compleate
Promise.all([getListFromDrive, getListFromFileSystem]).then(filenames => {
  let driveFiles  = filenames[0],
      serverFiles = filenames[1]

  console.log(serverFiles);
  console.log('-----------------');
  console.log(driveFiles);
  console.log('-----------------');
  // console.log(serverFiles.contains(driveFiles));
  console.log('-----------------');
  // console.log(driveFiles.equals(serverFiles));

  // Download missing files


}).catch(function (reason) {
     console.log("Promise Rejected");
     console.log(reason);
});;

// var request = require('request'),
// fs = require('fs');
//
// var url2 = 'http://l4.yimg.com/nn/fp/rsz/112113/images/smush/aaroncarter_635x250_1385060042.jpg';
//
// var r = request(url2);
//
// r.on('response',  function (res) {
//   res.pipe(fs.createWriteStream('./' + res.headers.date + '.' + res.headers['content-type'].split('/')[1]));
//
// });


// let a = new buckets.BSTree();
//
// a.add('one');
// a.add('two');
// a.add('three');
// a.add('four');
// a.add('one');
//
// console.log('---------BUCKET TEST----------');
// console.log(a.contains('one')); // ==> true
// console.log(a.toArray());
