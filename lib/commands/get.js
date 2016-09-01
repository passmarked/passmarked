// pull in our required modules
const config        = require('../config');
const Constants     = require('../constants');
const api           = require('../api');
const S             = require('string');
const opener        = require('opener');
const Models        = require('../models');

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // get the token variable
  var sections    = payload.getCommand().split(' ');
  var reportuid   = sections[1] || null;

  // run the track
  api.track({

    key:      'get',
    message:  'Requested the report uid ' + reportuid

  }, function(){

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

        // add the details
        output.push('Report for ' + result.get('domain') + ' which was created on ' + result.get('created'));
        output.push('');
        output.push('Full report can be viewed at ' + result.getPreviewUrl());
        output.push('');
        output.push('Result:');
        output.push('Status: \t' + result.getStatus());
        output.push('Result: \t' + result.getResult());
        output.push('Score: \t\t' + result.getScore());
        output.push('');
        output.push('Page:');
        output.push('Size: \t\t' + result.get('size') + ' bytes');
        output.push('LoadTime: \t' + result.get('loadtime') + ' ms');
        output.push('Requests: \t' + result.get('requests'));
        output.push('');
        output.push('Issues:');
        output.push('Total: \t\t' + (result.get('count') || 0));
        output.push('criticals: \t' + (result.get('criticals') || 0));
        output.push('errors: \t' + (result.get('errors') || 0));
        output.push('warnings: \t' + (result.get('warnings') || 0));
        output.push('notices: \t' + (result.get('notices') || 0));
        output.push('');
        output.push('Connection:')
        output.push('IP: \t\t' + (result.get('ip') || 0));
        output.push('Family: \t' + (result.get('family') || 0));
        output.push('City: \t\t' + (result.get('city') || 0));
        output.push('Region: \t' + (result.get('region') || 0));
        output.push('Country: \t' + (result.get('country') || 0));
        output.push('Lat: \t\t' + (result.get('lat') || 0));
        output.push('Lng: \t\t' + (result.get('lng') || 0));
        output.push('');
        output.push('Color Palette: \t' + (result.get('palette') || []).join(', '));
        output.push('Technologies: \t' + (result.get('stack') || []).join(', '));


        // done
        payload.setText(output.join('\n'));

        // done
        fn(null);

      });

    });

  });

};
