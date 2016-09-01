// pull in our required modules
const config        = require('../config');
const api           = require('../api');
const S             = require('string')
const async         = require('async');

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // get the token variable
  var sections      = payload.getCommand().split(' ');
  var emails        = (sections || []).slice(1, sections.length);

  // start tracking
  var started = new Date();

  // check if token is defined
  config.build(function(){

    // the output to give
    var outputText = [];
    var outputJSON = [];

    // run the track
    api.track({

      key:        'invite',
      message:    'Requested invites for ' + emails.join(', ')

    }, function(){

      // loop each email
      async.each(emails || [], function(email, cb) {

        // set the actual content
        api.subscribe({

          email:  email

        }, function(err, body) {

          // handle a error
          if(err) {

            // output to stderr
            payload.error('Something went wrong while connecting to service for token balance information', err);

            // done
            return cb(err);

          }

          // output
          outputJSON.push({

            email:    email,
            message:  body.message,
            status:   body.status

          })

          // did it validate ?
          if(body.status !== 'ok') {

            // nope ...
            payload.error('Problems while trying to invite ' + email + ' :(');

            // run the track
            return api.track({

              key:        'invite.error',
              message:    'Problems requesting invite for ' + email + ', server returned with message "' + body.message || '' + '"',
              duration:   (new Date().getTime() - started.getTime())

            }, function(){

              // done
              cb(new Error());

            });

          }

          // run the track
          api.track({

            key:        'invite.success',
            message:    'Successfully requested invite for ' + email,
            duration:   (new Date().getTime() - started.getTime())

          }, function(){

            // done
            cb(null);

          });

        });

      }, function(err) {

        // check for the error
        if(!err) {

          payload.setText('Invites are on the way, welcome !');

          // JSON
          payload.setJSON(outputJSON);

        }

        // done
        fn(err);

      });

    });

  });

};
