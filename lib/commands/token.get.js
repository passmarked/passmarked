// pull in our required modules
const config        = require('../config');
const api           = require('../api');
const S             = require('string')

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked token get requested');

  // check if token is defined
  config.build(function(){

    // check if the token was given ?
    if(S(config.getToken()).isEmpty() === true) {

      // output a error explaining what's happening
      payload.error('Passmarked CLI not authenticated');

      // we're done here >:|
      return fn(null);

    }

    // set the actual content
    api.me(null, function(err, body) {

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

      // depending on type set the response
      if(item.type == 'team') {

        // nothing yet
        payload.setText('not implemented yet');
        payload.setJSON({ message: 'not implemented yet' });

      } else if(item.type == 'website') {

        // nothing yet
        payload.setText('not implemented yet');
        payload.setJSON({ message: 'not implemented yet' });

      } else if(item.type == 'user') {

        // TEXT
        payload.setText('Logged in as ' + item.name + ' (' + item.email + ')');

        // JSON
        payload.setJSON(item);

      }

      // done
      fn(null);

    });

  });

};
