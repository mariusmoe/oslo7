// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  URL: {
    base:        'http://localhost:2000',
    feed:        'http://localhost:2000/api/feed',
    photoList:    'http://localhost:2000/api/photos/list',
    foldersList:    'http://localhost:2000/api/photos/folders'
  }
};
