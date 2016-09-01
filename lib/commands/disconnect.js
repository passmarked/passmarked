// pull in our required modules
const config        = require('../config');
const api           = require('../api');
const S             = require('string')

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // run the track
  api.track({

    key:      'disconnect',
    message:  'Disconnected from authenticated account'

  }, function(){

    // check if token is defined
    config.build(function(){

      // debugging
      payload.debug('Setting token to NULL');

      // clear the token
      config.setToken(null);

      // save that
      config.save(function(err){

        // output any errors we might have gotten
        if(err) {

          // output  to stderr
          payload.error('Something went wrong while saving new config', err);

        }

        // set the output
        var message = 'Token removed from local instance';
        payload.setText(message);
        payload.setJSON({

          message:  message,
          status:   'ok'

        });

        // done
        fn(err);

      });

    });

  });

};
