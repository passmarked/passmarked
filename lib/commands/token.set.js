// pull in our required modules
const config        = require('../config');
const Constants     = require('../constants');
const api           = require('../api');
const S             = require('string')

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked token set requested');

  // get the token variable
  var sections = payload.getCommand().split(' ');
  var token = sections[1] || null;

  // check if token is defined
  config.build(function(){

    // check if the token was given ?
    if(S(token).isEmpty() === true) {

      // output a error explaining what's happening
      payload.error('***************\n\nProvided token was empty, please run `passmarked connect` \nto request a token, or `passmarked token <token>` to set a token \ncopied from passmarked.com\n\n***************');

      // we're done here >:|
      return fn(null);

    }

    // set the actual content
    api.me(token, function(err, body) {

      // handle a error
      if(err) {

        // output to stderr
        payload.error('Something went wrong while connecting to service for token information', err);

        // done
        return fn(null);

      }

      // did it validate ?
      if(body.status !== 'ok') {

        // nope ...
        payload.error('***************\n\nProvided token was not able to authenticate with the service. To create a new token head over to `passmarked connect`.\n\n***************');

        // stop exec here
        return fn(null);

      }

      // get the user
      var item = body.item;

      // right all good then as new token and save
      config.setToken(token);

      // save to file
      config.save(function(err){

        // check for a error
        if(err) {

          // throw error
          payload.error('Problem saving config to file ' + Constants.CONFIG_FILE, err);

          // nope out of here
          return fn(err);

        }

        // set the output
        var message = 'Client was configured for ' + item.type + ' ' + (item.name || item.label || 'Blank');
        payload.setText(message);
        payload.setJSON({ message: message, status: 'ok' });
        payload.setXML('<Response>' + message + '</Response>');

        // done
        fn(null);

      });

    });

  });

};
