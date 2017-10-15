const folder = require('./libs/googleDrive');
const oak = require('./libs/oak-tree');
var buckets = require('buckets-js');

const ROOT_FOLDER_ID = '0Bzd-8gMv1MGANlhiQ2c1RmZkVXM';

let folderId = 465789
// Options to use when retriving data from google drive
let driveReq = {
  url: "https://www.googleapis.com/drive/v3/files",
  //q: 'parents in "0Bzd-8gMv1MGAbnhmODE0aVFyUWs"',
  jwt: {
    // use the email address of the service account, as seen in the API console
    // melodic-voice-110507@appspot.gserviceaccount.com
    // email: '370835289615-compute@developer.gserviceaccount.com',
    email: 'melodic-voice-110507@appspot.gserviceaccount.com',
    // use the PEM file we generated from the downloaded key
    keyFile: './config/your-key-file.pem',
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


let fileIDToName = new buckets.Dictionary()


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


folder.getDriveContent(ROOT_FOLDER_ID, driveReq)


// TODO fix drive folders so it is easier to test.
