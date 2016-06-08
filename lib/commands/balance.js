// pull in our required modules
const config        = require('../config');
const api           = require('../api');
const S             = require('string')

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked me requested');

  // check if token is defined
  config.build(function(){

    // check if the token was given ?
    if(S(config.getToken()).isEmpty() === true) {

      // output a error explaining what's happening
      payload.error('Passmarked CLI not authenticated.');

      // we're done here >:|
      return fn(new Error());

    }

    // set the actual content
    api.balance(function(err, body) {

      // handle a error
      if(err) {

        // output to stderr
        payload.error('Something went wrong while connecting to service for token balance information', err);

        // done
        return fn(err);

      }

      // local reference
      var item = body;

      // TEXT
      payload.setText(item.balance + ' credits available from ' + item.count + ' for the month');

      // JSON
      payload.setJSON({

        count:      item.count,
        available:  item.balance,
        used:       item.used

      });

      // done
      fn(null);

    });

  });

};
