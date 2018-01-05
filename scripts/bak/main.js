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

// getListOfFilesWithParents
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
Promise.all([getListFromFileSystem, retriveFolderStructure(rootFolderId, driveReq)]).then(filenames => {
  let serverFiles     = filenames[0]
  let googleFiles     = filenames[1][0]
  let googleFilesIDs  = filenames[1][1]


  let new_serverFiles = serverFiles.map(function(e) {
    // substring from 7 because ./media/ should be removed
    e = e.replace('//', '/').substring(8);
    return e;
  });

  console.log(new_serverFiles);
  console.log('-------------------------------------------------------------');
  console.log('All files on google Drive:');
  console.log(googleFiles);
  console.log('-------------------------------------------------------------');

  console.log('Files on google drive that are not on local server:');
  console.log(googleFiles.difference(new_serverFiles));
  console.log('-------------------------------------------------------------');
  console.log('Files on the server that are not on google drive:');
  console.log(new_serverFiles.difference(googleFiles));

  let filepathWithNameToId = []
  googleFiles.forEach((file, i) => {
    filepathWithNameToId.push({id: googleFilesIDs[i].id, pathName: file})
  })
  console.log(filepathWithNameToId);

  const filesOnDriveNotOnLocalServer = googleFiles.difference(new_serverFiles)

  filesOnDriveNotOnLocalServer.forEach((fileWithPath, i) => {
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
        let fileToDownloadObject = filepathWithNameToId.find((i) => {return i.pathName == fileWithPath});
        // Call download file
        // imageId, driveReq, pathToImage
        // TODO thios does not work!!!

        downloadImage(fileToDownloadObject.id ,driveReq, createFoldersString + '/' +fileWithPathList[fileWithPathList.length - 1]);
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


    // for fileWithPath of length >= 2
    // check if path exists if NOT
    // try to go down each level; IF level does not exist => create levels from that point
    // download and save the file at that position

  })

  // Download missing files

}).catch(function (reason) {ø
     console.log("Promise Rejected");
     console.log(reason);
});




const request = require('google-oauth-jwt').requestWithJWT();

const downloadImage = ((imageId, driveReq, pathToImage) => {
  return new Promise ((resolve,reject) => {
  // let imageId = '0Bzd-8gMv1MGAdVJhWEVfaTZJTUk'
  driveReq.url = "https://www.googleapis.com/drive/v3/files/" + imageId + "?alt=media"
  driveReq.encoding = null;
  request.get( driveReq, (err, res, body) => {
    console.log('-----------------------------------------------------');
    console.log(res.headers['content-type']);
    console.log(body);
    console.log(pathToImage);
    if (res.headers['content-type'] == 'image/jpeg' || res.headers['content-type'] == 'image/png') {
      const streamImage = fs.WriteStream(pathToImage);
      streamImage.write(body);
      streamImage.end(() => {
        console.log('The stream is over and data has been saved');
        resolve()
    })
    }
    if (res.headers['content-type'] == 'application/json; charset=UTF-8') {
      console.log(res.headers['content-type'])
      const fileBuffer = new Buffer(res.body, 'binary' );
      const file2 = fileBuffer.toString('utf8');
      console.log(file2);
      resolve()
    }
  })
})
})
// downloadImage('0Bzd-8gMv1MGAMkFULV96OG1Uc3M', driveReq, 'myfile.jpg');
  // request.get(driveReq, function (err, res, body) {
  //
  // });
