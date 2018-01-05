// TODO: reserved address space for error CODES
// example: successful auth messages have address
// 1000 - 1100
// successful survey messages have address
// 1101 - 1200 and so on
module.exports = {
  USER_NOT_FOUND: {
    message: 'Could not find user',
    code: 2011
  },
  ACCOUNT_CREATED: {
    message: 'Account successfully created',
    code: 1000
  },
  EMAIL_NOT_AVILIABLE: {
    message: 'The email is already in use',
    code: 2013
  },
  NO_EMAIL_OR_PASSWORD: {
    message: 'Missing email or password',
    code: 2014
  },
  TRY_AGAIN: {
    message: 'could not do that, try again',
    code: 2015
  },
  REFERRAL_CREATED: {
    message: 'Referral link established correctly',
    code: 1012
  },
  REFERRAL_LINK_EXPIRED: {
    message: 'The referral link has expired.',
    code: 2016
  },
  REFERRAL_LINK_WRONG: {
    message: 'The referral link provided is wrong',
    code: 2017
  },
  REFERRAL_LINK_USED: {
    message: 'The referral link provided has already been used',
    code: 2018
  },
  ROLE_INCORRECT: {
    message: 'The role provided is invalid',
    code: 2013
  },
  ROUTE_USERS_VALID_NO_USERS: {
    message: 'Route valid but no users was found',
    code: 2031
  },
  EMAIL_CHANGED: {
    message: 'Email changed',
    code: 1016
  },
  PASSWORD_CHANGED: {
    message: 'Password changed',
    code: 1017
  },
  INSUFFICIENT_PRIVILEGES: {
    message: 'Insufficient privileges.',
    code: 2050
  },


  // SURVEY CODES
  SURVEY_UNPROCESSABLE: {
    message: 'Survey could not be processed. Check validity.',
    code: 2019
  },
  SURVEY_NOT_FOUND: {
    message: 'Survey could not be found',
    code: 2020
  },
  SURVEY_OBJECT_MISSING: { // used when a survey is supposedly being sent TO the server
    message: 'Could not find a survey',
    code: 2021
  },
  SURVEY_UPDATED: {
    message: 'Survey has been updated',
    code: 1013
  },
  SURVEY_DELETED: {
    message: 'Survey has been deleted',
    code: 1014,
  },
  SURVEY_BAD_ID: {
    message: 'The id provided for the survey is malformed',
    code: 2022
  },
  SURVEY_COPY_FAILED: {
    message: 'The copy failed at copying the survey',
    code: 2023
  },
  SURVEY_COPY_FAILED_RESPONSES: {
    message: 'The copy failed at copying responses',
    code: 2024
  },
  SURVEY_DELETED: {
    message: 'Survey has been deleted',
    code: 2025
  },
  SURVEY_DEACTIVATED: {
    message: 'Survey has been deactivated',
    code: 2865
  },

  SURVEY_PUBLISHED: {
    message: 'Survey is published and cannot be changed. Try to copy this survey if you want to make changes.',
    code: 2075
  },
  NO_NICKNAME_PROVIDED: {
    message: 'No nickname provided',
    code: 2026
  },
  NICKNAME_TAKEN: {
    message: 'nickname taken',
    code: 2027
  },
  UNKNOWN_NICKNAME: {
    message: 'Unknown nickname',
    code: 2028
  },
  NO_NICKNAMES_FOUND: {
    message: 'Could not find any nicknames',
    code: 2029
  },
  NEED_CENTER: {
    message: 'Need center to store image',
    code: 6789
  },

  // ROUTER CODES
  ROUTE_INVALID: {
    message: "The requested route does not exist. Did you forget a param?",
    code: 2030
  },
  ROUTE_SURVEYS_VALID_NO_SURVEYS: {
    message: "Request successful, but no surveys exist.",
    code: 1015
  },
  FAILED_UPLOAD: {
    message: "Failed to upload. Maybe the key is wrong?.",
    code: 2019
  },
  UPLOAD_SUCCESS: {
    message: 'Uploaded file successfully.',
    code: 1017
  },

  // SURVEY RESPONSES CODES
  SURVEY_RESPONSE_SUCCESS: {
    message: "The response has been registered successfully.",
    code: 1016,
  },
  SURVEY_RESPONSE_UNPROCESSABLE: {
    message: 'Response could not be processed. Check validity.',
    code: 2031
  },
  SURVEY_RESPONSE_OBJECT_MISSING: {
    message: 'Could not find a response.',
    code: 2032
  },

  // ESCAPE SURVEY CODES
  ESCAPE_MISSING_PASSWORD: {
    message: 'The request requires a password to be set.',
    code: 2033,
  },
  ESCAPE_MISSING_CENTER: {
    message: 'The request parameter center is invalid.',
    code: 2033,
  },
  ESCAPE_PATCH_ERROR: {
    message: 'There was an error updating the password.',
    code: 2033,
  },
  ESCAPE_PATCH_SUCCESSFUL: {
    message: 'The password has been successfully updated.',
    code: 1017,
  },
  ESCAPE_COMPARE_TRUE: {
    message: 'The password was matched successfully.',
    code: 1018,
  },
  ESCAPE_COMPARE_FALSE: {
    message: 'The password did not match.',
    code: 1019,
  },
  NO_NAME_PROVIDED: {
    message: 'No name was provided',
    code: 2065
  },
  NAME_CHANGED: {
    message: 'Name changed successfully',
    code: 1873
  },
  CENTER_ADDED: {
    message: 'Center was added successfully',
    code: 1467
  },
  ROUTE_CENTERS_VALID_NO_CENTERS: {
    message: "Request successful, but no centers exist.",
    code: 1367
  },

  WRONG_CENTER: {
    message: 'You do not have sufficcient privileges for this center.',
    code: 2088
  },


  // FOLDER CODES

  FOLDER_CREATED: {
    message: 'The folder was successfully created.',
    code: 3001,
  },
  FOLDER_OBJECT_MISSING: {
    message: 'Could not find a folder.',
    code: 3002,
  },
  FOLDER_UNPROCESSABLE: {
    message: 'Folder could not be processed. Check validity.',
    code: 3003,
  },
  FOLDER_PARENT_FOLDERID_MISSING: {
    message: 'Could not find parent folderId.',
    code: 3004,
  },
  FOLDER_COULD_NOT_RETRIEVE_ALL: {
    message: 'Could not retrieve all folders.',
    code: 3005,
  },
  FOLDER_ID_MISSING: {
    message: 'Could not find the ID to update folder.',
    code: 3006,
  },
  FOLDER_SECONDARY_ID_MISSING: {
    message: 'Could not find the ID of the secondary folder to update folder.',
    code: 3007,
  },
  FOLDER_SUCCESSFULLY_UPDATED: {
    message: 'The folder(s) was successfuly updated.',
    code: 3008,
  },
  FOLDER_NOT_FOUND: {
    message: 'Could not find the requested folder.',
    code: 3009
  },
  FOLDER_DELETED: {
    message: 'The folder and all its content was successfully deleted.',
    code: 3010
  },
  FILE_INVALID: {
    message: 'File is invalid',
    code: 3032
  },




}
