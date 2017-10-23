const request = require('google-oauth-jwt').requestWithJWT();

const walk    = require('walk');
const fs      = require('fs');
// var Set = require('jsclass/src/set').Set;
const mimeType = 'application/vnd.google-apps.folder';
/**
 * Get content from one folderId
 * @param  {string} folderId ID of folder to Check
 * @param  {Obj} driveReq drive request settings
 * @param  {string} mimeType what kind of file to look forEach
 * @return {Obj}          files in current folder, folders in current folders
 */
module.exports.getContent = function(folderId, driveReq) {

  return new Promise((resolve, reject) => {




  // TODO Check that params are valid and present

    // console.log('*******************\nfolderID: '+folderID+'\nmimeType: '+ mimeType);
    let parentString = "?q='"+folderId+"'+in+parents";
    driveReq.url = "https://www.googleapis.com/drive/v3/files"+parentString
    driveReq.encoding = undefined;
    // console.log(parentString);
    request( driveReq, (err, res, body) => {
      if (err){ console.error(err); }

      let folderIDAtPath = [],
          folderNameAtPath = [],
          _driveFiles =[];

      // Parse response
      const parsedBody = JSON.parse(body);
      // console.log(parsedBody);

      if (parsedBody.files) {
        parsedBody.files.forEach((file) => {
          // Interesting mime types: image/jpeg, application/vnd.google-apps.folder
          if (file.mimeType === mimeType){
            folderIDAtPath.push(file.id);
            folderNameAtPath.push(file.name);
          }
          // If the file is anyting but a folder, add it to drive files
          if (file.mimeType != mimeType){
            _driveFiles.push(file.name);
          }
        });
      }

      // return [_driveFiles, folderIDAtPath];
      resolve([_driveFiles, folderIDAtPath, folderNameAtPath])
    })


  })
};



/**
 * Get a list of all folders nested in the root folderId
 * @param  {string} folderId The root folderId
 * @param  {Object} driveReq drive request settings
 * @return {Object[]}          List with folder objects
 */
module.exports.getListOfFolders = function(folderId, driveReq) {

  return new Promise((resolve, reject) => {

  // TODO Check that params are valid and present

    // console.log('*******************\nfolderID: '+folderID+'\nmimeType: '+ mimeType);
    let parentString = "?q="+"mimeType = 'application/vnd.google-apps.folder'";
    driveReq.url = "https://www.googleapis.com/drive/v3/files"+parentString
    driveReq.encoding = undefined;
    // console.log(parentString);
    request( driveReq, (err, res, body) => {
      if (err){ console.error(err); }

      let folders = []

      // Parse response
      const parsedBody = JSON.parse(body);
      // console.log(parsedBody);

      if (parsedBody.files) {
        parsedBody.files.forEach((file) => {
          // Interesting mime types: image/jpeg, application/vnd.google-apps.folder
          folders.push(file);

        });
      }
      resolve(folders);
    })


  })
};


/**
 * Get a list of all folders nested in the root folderId
 * @param  {string} folderId The root folderId
 * @param  {Object} driveReq drive request settings
 * @return {Object[]}          List with folder objects
 */
module.exports.getListOfFilesWithParents = function(folderId, driveReq) {

  return new Promise((resolve, reject) => {

    let parentString = "?q="+"mimeType = 'application/vnd.google-apps.folder'";
    driveReq.url = "https://www.googleapis.com/drive/v3/files?fields=kind%2CnextPageToken%2CincompleteSearch%2Cfiles%2Fparents%2Cfiles%2Fid%2Cfiles%2FmimeType%2Cfiles%2Fname"
    driveReq.encoding = undefined;
    request( driveReq, (err, res, body) => {
      if (err){ console.error(err); }

      let files = []

      // Parse response
      const parsedBody = JSON.parse(body);
      // console.log(parsedBody);

      if (parsedBody.files) {
        parsedBody.files.forEach((file) => {
          // Interesting mime types: image/jpeg, application/vnd.google-apps.folder
          if (file.mimeType != 'application/vnd.google-apps.folder') {
            files.push(file);
          }
        });
      }
      // console.log(files);
      // console.log('----------------------------------------');
      // console.log(parsedBody.files);
      // console.log('----------------------------------------');
      resolve([files, parsedBody.files]);
    })


  })
};

// let testImage = '0Bzd-8gMv1MGAdVJhWEVfaTZJTUk'
// driveReq.url = "https://www.googleapis.com/drive/v3/files/" + testImage + "?alt=media"
// driveReq.encoding = null;
//   request.get( driveReq, (err, res, body) => {
//     // console.log(res);
//     console.log('-----------------------------------------------------');
//     // console.log(body);
//     if (res.headers['content-type'] == 'image/jpeg') {
//       const streamImage = fs.WriteStream('file.jpg');
//       streamImage.write(body);
//       streamImage.end(() => {console.log('The stream is over and data has been saved');})
//
//     }
//     // console.log(res.statusCode) // 200
//     console.log(res.headers['content-type'])
//     if (res.headers['content-type'] == 'application/json; charset=UTF-8') {
//       var fileBuffer = new Buffer(res.body, 'binary' );
//        var file2 = fileBuffer.toString('utf8');
//        console.log(file2);
//     }
//     // console.log(res.headers.size);
//
//     console.log('Done!');
//     // const buffer = Buffer.from(res.body, 'utf8');
//     //     fs.writeFileSync('', buffer);
//   })



/**
 * @depricated
 * get local files
 * @param  {Object}   options  walker options, folders to ignore etc.
 * @return {List}              List with all files on disk
 */
module.exports.getLocalFiles = (options) => {
  // A set with all files found on the server
  let serverFiles = []
  // let serverFiles = new buckets.BSTree();


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
  walker.on('end', () => {
    console.log("All done sendeing the walker list!");
    return serverFiles;
  });
};
