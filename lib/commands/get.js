// pull in our required modules
const config        = require('../config');
const Constants     = require('../constants');
const api           = require('../api');
const S             = require('string');
const opener        = require('opener');

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

      // open up in browser if required
      if(payload.getArguments().open === true) {

        // show the url to head over to that will
        // allow them to find their token
        try {

          // try to open the url
          opener([

            Constants.WEB_URL,
            body.domain,
            body.uid.slice(0, 4),
            body.uid.slice(4, 6),
            body.uid

          ].join('/') + '?source=passmarked.cli');

        } catch(err) { /** Was worth a shot **/ }

      }

      // local reference
      payload.setJSON(body);
      payload.setText('Report #' + body.uid);

      // done
      fn(null);

    });

  });

};
