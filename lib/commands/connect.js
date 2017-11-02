// pull in our required modules
const config        = require('../config');
const Constants     = require('../constants');
const api           = require('../api');
const S             = require('string');
const opener        = require('opener');
const http          = require('http');
const querystring   = require('querystring');
const _             = require('lodash');
const readline      = require('readline');

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // check if token is defined
  config.build(function(){

    // the url we will open or instruct to open
    var integrationURL  = config.getWebsiteURL() + '/grant';

    var queryParams     = {

      source: Constants.SOURCE

    };

    // default assigned to null
    var server = null;

    const rl = readline.createInterface({

      input: process.stdin,
      output: process.stdout

    });

    /**
    * Handle when the token was received
    **/
    var handleTokenReceived = _.once(function(receivedToken) {

      // close the server
      try {

        if(server !== null)
          server.close();

      } catch(err) { /** Process is short lived so don't worry to much if we failed to cleanup **/ }

      try {

        // close the readline interface to get the capture of the screen back
        rl.close();

      } catch(err) {}

      // token must not be blank ...
      if( S(receivedToken).isEmpty() === true ) {

        // stop exec here
        payload.error('Supplied token can not be blank');

        // stop
        return fn(new Error());

      }

      // write out a update
      payload.write('-----\nChecking validity of supplied token...', true);

      // check if this a valid token
      api.user({

        token: receivedToken

      }, function(err, response) {

        // handle a error
        if(err) {

          // output to stderr
          payload.error('Problem contacting the Passmarked service to verify token', err);

          // done
          return fn(err);

        }

        // if anything else than ok report that
        if( response.status != 'ok' ) {

          // run the track
          return api.track({

            key:      'connect.callback.error',
            message:  'Unable to verify token because "' + response.message + '"'

          }, function(){

            // show the error
            payload.error('-----\nWas not able to verify token ...');

            // report back error to exit with 1
            fn(new Error());

          });

        }

        // if we got here all good then, set token and move on
        config.setToken(receivedToken);

        // save config
        config.save(function(err) {

          // check for a error
          if(err) {

            // output to stderr
            payload.error('Problem new token to config', err);

            // done
            return fn(err);

          }

          // set the overal message to respond back to
          var message = '\n-----\nToken loaded for ' + (response.item.name || response.item.label || 'NONAME') + ' (' + (response.item.email || 'Unknown Email') + ')';
          payload.setText(message);
          payload.setJSON({

            message:  message,
            status:   'ok'

          });

          // run the track
          return api.track({

            key:      'connect.callback',
            message:  'Token verified and updated for ' + (response.item.name || 'Unknown')

          }, function(){

            // report back
            fn(null);

          });

        });

      });

    });

    // create the actual server
    server = http.createServer(function(req, res) {

      // parse the query string
      var query = querystring.parse(req.url.split('?')[1] || '');

      // was the token given ?
      if(query.token) {

        // pass back the token
        handleTokenReceived(query.token);

        // close this response
        res.end('Token received, head back to your terminal :)');

      } else res.end('No token was given ...');

    });

    // start our server on a random open port
    server.listen(0);
    server.on('listening', function() {

      // get the port for the redirect
      var randomAssignedPort = server.address().port;

      // show the url to head over to that will
      // allow them to find their token
      try {

        // try to open the url
        opener(integrationURL + '?' + querystring.stringify(_.extend({}, queryParams, {

          return: 'http://localhost:' + randomAssignedPort

        })));

        // run the track
        api.track({

          key:      'connect.open',
          message:  'Was able to open browser for random server on port ' + randomAssignedPort + ' to ' + integrationURL + '?' + querystring.stringify(_.extend({}, queryParams, {

            return: 'http://localhost:' + randomAssignedPort

          }))

        }, function(){});

      } catch(err) {

        // run the track
        api.track({

          key:      'connect.open.failed',
          message:  'Unable to open browser for random server on port ' + randomAssignedPort

        }, function(){});

      }

    });

    // run the track
    api.track({

      key:      'connect',
      message:  'Connect requested and url given was ' + integrationURL

    }, function(){

      // override and write out our variable
      payload.write('******\n\nHead over to:\n' +
        integrationURL +
        '\nwhere a token will be generated.\n' +
        'Copy and paste token here once done.\n\n******', true);

      // ask for the actual token, for servers that have no browser / window
      rl.question(

        'Enter generated token: ',
        function(token) {

          // TODO: Log the answer in a database
          handleTokenReceived(token);

        });

    });

  });

};
