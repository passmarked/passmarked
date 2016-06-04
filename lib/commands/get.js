// pull in our required modules
const config        = require('../config');
const api           = require('../api');
const S             = require('string')

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked me requested');

  // get the token variable
  var sections    = payload.getCommand().split(' ');
  var reportuid   = sections[1] || null;

  // check if token is defined
  config.build(function(){

    // check if the token was given ?
    if(S(reportuid).isEmpty() === true) {

      // output a error explaining what's happening
      payload.error('Please supply the UID of the report to download');

      // we're done here >:|
      return fn(null);

    }

    // set the actual content
    api.get(reportuid, function(err, body) {

      // handle a error
      if(err) {

        // output to stderr
        payload.error('Was unable to find the report', err);

        // done
        return fn(err);

      }

      // local reference
      payload.setJSON(body);
      payload.setText('Report #' + body.uid);

      // done
      fn(null);

    });

  });

};
