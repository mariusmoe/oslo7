const request = require('google-oauth-jwt').requestWithJWT();

const walk    = require('walk');
const fs      = require('fs');
var Set = require('jsclass/src/set').Set;

/**
 * Get content from one folderId
 * @param  {string} folderId ID of folder to Check
 * @param  {Obj} driveReq drive request settings
 * @param  {string} mimeType what kind of file to look forEach
 * @return {Obj}          files in current folder, folders in current folders
 */
module.exports.getContent = function(folderId, driveReq, mimeType) {
  // TODO Check that params are valid and present

    // console.log('*******************\nfolderID: '+folderID+'\nmimeType: '+ mimeType);
    let parentString = "?q='"+folderID+"'+in+parents";
    // console.log(parentString);
    request( driveReq, (err, res, body) => {
      if (err){ console.error(err); }

      let folderIDAtPath = [],
          folderNameAtPath = [],
          _driveFiles =[];
      // console.log(body);

      // Parse response
      const parsedBody = JSON.parse(body);

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
      return [_driveFiles, folderIDAtPath];
    })
};


module.exports.getLocalFiles = function(options) {
  // A set with all files found on the server
  let serverFiles = new Set([]);
  // let serverFiles = new buckets.BSTree();


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
  walker.on('end', () => {
    return(serverFiles);
  });
};
