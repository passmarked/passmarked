// pull in our required modules
const config        = require('../config');
const Constants     = require('../constants');
const api           = require('../api');
const S             = require('string');
const opener        = require('opener');
const Models        = require('../models');

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
    api.get({

      token:      config.token,
      key:        reportuid

    }, function(err, body) {

      // handle a error
      if(err) {

        // output to stderr
        payload.error('Problem downloading historical report', err);

        // done
        return fn(err);

      }

      // check if we found it
      if(!body.item) {

        // output to stderr
        payload.error('Was unable to find the report');

        // done
        return fn(null);

      }

      // create the page item
      var result = Models.createPage(body.item || {});

      // open up in browser if required
      if(payload.getArguments().open === true) {

        // show the url to head over to that will
        // allow them to find their token
        try {

          // try to open the url
          opener(result.getPreviewUrl(true));

        } catch(err) { /** Was worth a shot **/ }

      }

      // local reference
      payload.setJSON(body.item || null);

      // output to send
      var output = [];

      // done
      payload.setText(output.join('\n'));

      // done
      fn(null);

    });

  });

};
