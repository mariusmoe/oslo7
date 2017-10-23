const gDrive = require('./libs/googleDrive');
const oak = require('./libs/oak-tree');
const walk    = require('walk');
const fs      = require('fs');
const path      = require('path');
const mkdirp = require('mkdirp');

const rootFolderId  = '0Bzd-8gMv1MGANlhiQ2c1RmZkVXM';
const secretKeyPem      = path.normalize('../scripts/config/your-key-file.pem');

let folderId = 465789
let parentString = "?q='"+rootFolderId+"'+in+parents";
// Options to use when retriving data from google drive
let driveReq = {
  encoding: null,
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

Array.prototype.difference = function(a) {
  return this.filter((i) => {return a.indexOf(i) < 0;});
};


let fullPathList  = [];
let folderQueue   = [];
let count = 1;

// Create list of files on googleDrive
const _peekFolder = ((folderId, driveReq, level) => {
  return new Promise ((resolve,reject) => {
    const peekFolder = ((folderId, driveReq, level, folders, searchedFolders) => {
      gDrive.getContent(folderId, driveReq).then((driveReqResult) => {
        let driveFiles   =  driveReqResult[0],
        folderIDAtPath    =  driveReqResult[1],
        folderNameAtPath  =  driveReqResult[2];

        // Add file to fullpath with its full path
        driveFiles.forEach((_file, i) => {
          fullPathList.push(level + '/' +_file);
        });

        count += 1;
        folderIDAtPath.forEach((_folderId, i) => {
          peekFolder(_folderId, driveReq, level + '/' + folderNameAtPath[i],
                     folders, searchedFolders + i)
        });
        if (folders.length  == count-1) {
          resolve(fullPathList);
        }
      })
    })
    gDrive.getListOfFolders(rootFolderId, driveReq).then((folders) => {
      peekFolder(rootFolderId, driveReq, level, folders, 0);
    })
  })
})


// first ask for meta on everything espesially folders, then recursivly search for
// files and folders until searched folders is the same as how many folders are in the damn drive



// Walk the file structure to see wiche files is already stored localy
let getListFromFileSystem = new Promise ((resolve,reject) => {
  // A set with all files found on the server
  let serverFiles = []
  // let serverFiles = new buckets.BSTree();

  // Walker options
  options = {
    followLinks: false   // We do not want this
    // directories with these keys will be skipped
  , filters: ["Temp", "_Temp", "node_modules", "arboreal", ".git"]
  };
  // Defines walker - Defines where to start walking from
  let walker  = walk.walk('./media', options);
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
Promise.all([getListFromFileSystem, _peekFolder(rootFolderId, driveReq, '')]).then(filenames => {
  let serverFiles  = filenames[0]
  let googleFiles  = filenames[1]

  let new_serverFiles = serverFiles.map(function(e) {
    // substring from 7 because ./media should be removed
    e = e.replace('//', '/').substring(7);
    return e;
  });

  console.log('-------------------------------------------------------------');
  console.log('All files on google Drive:');
  console.log(googleFiles);
  console.log('-------------------------------------------------------------');

  console.log('Files on google drive that are not on local server:');
  console.log(googleFiles.difference(new_serverFiles));
  console.log('-------------------------------------------------------------');
  console.log('Files on the server that are not on google drive:');
  console.log(new_serverFiles.difference(googleFiles));

  const filesOnDriveNotOnLocalServer = googleFiles.difference(new_serverFiles)

  filesOnDriveNotOnLocalServer.forEach((fileWithPath) => {
    // TODO prevent this for loop to go too fast, see drive api for quotas
    const fileWithPathList = fileWithPath.split('/');
    // the slice has not yet happend so this fires too often
    // TODO fix this!!!
    if (fileWithPathList.length >= 2) {
      const createFolders = fileWithPathList.slice(0,-1);
      //console.log(createFolders);
      const createFoldersString = './media/'+createFolders.join('/');
      mkdirp(createFoldersString,'0755', function (err) {
        if (err) {
          console.error(err)
          console.log('ERROR')
        }
        console.log('pow!')
        // Call download file
      });

    } else {
      // Just save the file in the media folder
      let tr = null;
    }
    // use https://www.npmjs.com/package/mkdirp
    //
    //
    // SE this
    // https://developers.google.com/drive/v3/web/performance
    // curl 'https://www.googleapis.com/drive/v3/files?q='0Bzd-8gMv1MGAWlZ3S3ZPdzVWV2s'%20in%20parents&fields=kind%2CnextPageToken%2CincompleteSearch%2Cfiles%2Fparents%2Cfiles%2Fid' \
    // -H 'Authorization: Bearer [YOUR_BEARER_TOKEN]' \
    // -H 'Accept: application/json' \
    // --compressed
    //
    // const rootFolderId
    // For in retrived list
    //  if mime is png/jpg
    //    let fullPathForFile = [name of file with file extension]
    //    while folder != rootFolderId
    //      fullPathForFile.concat(parants[0])
    //      folder = parants[0]
    //    fullPathList.push(fullPathForFile.reverse().join('/'))
    //
    //

    // for fileWithPath of length >= 2
    // check if path exists if NOT
    // try to go down each level; IF level does not exist => create levels from that point
    // download and save the file at that position

  })

  // Download missing files

}).catch(function (reason) {ø
     console.log("Promise Rejected");
     console.log(reason);
});;




const request = require('google-oauth-jwt').requestWithJWT();

const downloadImage = ((imageId, driveReq) => {
  let imageId = '0Bzd-8gMv1MGAdVJhWEVfaTZJTUk'
  driveReq.url = "https://www.googleapis.com/drive/v3/files/" + imageId + "?alt=media"
  request.get( driveReq, (err, res, body) => {
    console.log('-----------------------------------------------------');
    if (res.headers['content-type'] == 'image/jpeg') {
      const streamImage = fs.WriteStream('file.jpg');
      streamImage.write(body);
      streamImage.end(() => {console.log('The stream is over and data has been saved');})
    }
    if (res.headers['content-type'] == 'application/json; charset=UTF-8') {
      console.log(res.headers['content-type'])
      const fileBuffer = new Buffer(res.body, 'binary' );
      const file2 = fileBuffer.toString('utf8');
      console.log(file2);
    }
  })
})
  // request.get(driveReq, function (err, res, body) {
  //
  // });
