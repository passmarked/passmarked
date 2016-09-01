// pull in our required modules
const config        = require('../config');
const api           = require('../api');
const S             = require('string')

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // check if token is defined
  config.build(function(){

    // check if the token was given ?
    if(S(config.getToken()).isEmpty() === true) {

      // run the track
      return api.track({

        key:      'token.get',
        message:  'Information about token requested but no token was configured'

      }, function() {

        // output a error explaining what's happening
        payload.error('Passmarked CLI not authenticated');

        // we're done here >:|
        return fn(null);

      });

    }

    // run the track
    api.track({

      key:      'token.get',
      message:  'Information about the authenticated token requested'

    }, function() {

      // set the actual content
      api.user({

        token: config.getToken()

      }, function(err, body) {

        // handle a error
        if(err) {

          // output to stderr
          payload.error('Something went wrong while connecting to service for token information', err);

          // done
          return fn(null);

        }

        // get the user
        var item = body.item;

        // did it validate ?
        if(body.status !== 'ok') {

          // nope ...
          payload.error('Configured token was not able to authenticate with the service.');

          // stop exec here
          return fn(null);

        }

        // TEXT
        payload.setText('Logged in as ' + item.name + ' (' + item.email + ')');

        // JSON
        payload.setJSON(item);

        // done
        fn(null);

      });

    });

  });

};
