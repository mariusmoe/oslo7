"use strict";

const status = require('../status'),
      Photo  = require('../models/photo'),
      NodeCache = require( "node-cache" ),
      FB = require('fb'),
      config = require('config'),
      myCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });



// POST
exports.getFeed = (req, res, next) => {
  myCache.get( "feed", function( err, value ){
    if( !err ){
      if(value == undefined){
        // key not found
        console.log('Chach returned undefined...');
        // Start query to FB and store the result
        FB.api('oauth/access_token', {
            client_id: config.id,
            client_secret: config.secret,
            grant_type: 'client_credentials'
        }, function (fres) {
            if(!fres || res.error) {
                console.log(!fres ? 'error occurred' : fres.error);
                return;
            }

            var accessToken = fres.access_token;
            console.log(accessToken);
            FB.setAccessToken(accessToken);
            FB.api('7oslo/feed', function (fres2) {
              if(!fres2 || fres2.error) {
               console.log(!res ? 'error occurred' : fres2.error);
               return;
              }
              console.log(fres2.data);
              const feedData = fres2.data;
              myCache.set( "feed", feedData, function( err, success ){
                if( !err && success ){
                  console.log( success );
                  console.log( '*****************************' );
                  console.log( 'Feed has been cashed!' );
                  // true
                  // ... do something ...
                }
              });
              return res.status(200).send( feedData );
            });
        });

      }else{
        //console.log( value );
        return res.status(200).send( value );
        //{ my: "Special", variable: 42 }
        // ... do something ...
        // All is well. Should return the chached value
      }
    }
  });
}
