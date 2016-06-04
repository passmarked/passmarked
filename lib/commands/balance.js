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
      payload.error('***************\n\nPassmarked CLI not authenticated, please run `passmarked connect` \nto request a token, or `passmarked token <token>` to set a token \ncopied from passmarked.com\n\n***************');

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
      payload.setText([

          ['count',       item.count].join(': '),
          ['available',   item.balance].join(': '),
          ['used',        item.used].join(': ')

        ].join('\n'));

      // JSON
      payload.setJSON({

        count:      item.count,
        available:  item.balance,
        used:       item.used

      });

      // XML
      payload.setXML([

        '<Response>',
        '<Count>' +  item.count + '</Count>',
        '<Available>' + item.balance + '</Available>',
        '<Used>' + item.used + '</Used>',
        '</Response>'

        ].join('\n'));

      // done
      fn(null);

    });

  });

};
