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
      payload.error('***************\n\nPassmarked CLI not authenticated, please run `passmarked connect` \nto request a token, or `passmarked token <token>` to set a token \ncopied from passmarked.com\n\n***************');

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
        payload.error('***************\n\nConfigured token was not able to authenticate with the service. To create a new token head over to `passmarked connect`.\n\n***************');

        // stop exec here
        return fn(null);

      }

      // depending on type set the response
      if(item.type == 'team') {

        // nothing yet
        payload.setText('not implemented yet');
        payload.setJSON({ message: 'not implemented yet' });
        payload.setXML('<Response>not implemented yet</Response>');

      } else if(item.type == 'website') {

        // nothing yet
        payload.setText('not implemented yet');
        payload.setJSON({ message: 'not implemented yet' });
        payload.setXML('<Response>not implemented yet</Response>');

      } else if(item.type == 'user') {

        // TEXT
        payload.setText([

            ['user id',       item.id].join(': '),
            ['type',          item.type].join(': '),
            ['name',          item.name].join(': '),
            ['email',         item.email].join(': '),
            ['created',       item.created].join(': '),
            ['signup',        item.signup].join(': '),
            ['lastlogin',     item.lastlogin].join(': '),
            ['lastupdated',   item.lastupdated].join(': '),
            ['providers',     (item.providers || []).join(',')].join(': '),

          ].join('\n'));

        // JSON
        payload.setJSON(item);

        // XML
        payload.setXML([

          '<Response id="' + item.id + '" type="' + item.type + '">',
          '<Name>' +  item.name + '</Name>',
          '<Email>' + item.email + '</Email>',
          '<Created>' + item.name + '</Created>',
          '<Lastupdated>' + item.lastupdated + '</Lastupdated>',
          '<Lastlogin>' + item.lastlogin + '</Lastlogin>',
          '<Signup>' + item.signup + '</Signup>',
          '<Providers>' + (item.providers || []).join(',') + '</Providers>',
          '</Response>'

          ].join('\n'));

      }

      // done
      fn(null);

    });

  });

};
