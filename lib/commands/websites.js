// pull in our required modules
const config        = require('../config');
const api           = require('../api');
const S             = require('string')

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // get the token variable
  var sections    = payload.getCommand().split(' ');
  var reportuid   = sections[1] || null;

  // check if token is defined
  config.build(function(){

    // get the token
    var token = config.getToken();

    // we must have a token to execute this ...
    if(S(token).isEmpty() === true) {

      // output a error explaining what's happening
      payload.error('Passmarked CLI not authenticated.');

      // run the track
      return api.track({

        key:      'websites',
        message:  'Passmarked CLI not authenticated.',
        type:     'error'

      }, function(){

        // we're done here >:|
        fn(new Error());

      });

    }

    // set the actual content
    api.websites({

      token:  token

    }, function(err, response) {

      // handle a error
      if(err) {

        // output to stderr
        payload.error('Was unable to retrieve the list of websites', err);

        // done
        return fn(err);

      }

      // must be ok
      if(response.status != 'ok') {

        // output to stderr
        payload.error('Unable to authenticate with the Passmarked service', err);

        // run the track
        return api.track({

          key:      'websites',
          message:  'Unable to authenticate with the Passmarked service',
          type:     'error'

        }, function(){

          // we're done here >:|
          fn(new Error());

        });

      }

      api.track({

        key:        'websites',
        message:    'Found ' + (response.items || []).length + " registered websites for token"

      }, function() {

        // build the text output
        var textOutput = [];

        // check the length
        if((response.items || []).length > 0) {

          // add a message that we found no websites
          textOutput.push('Found ' + (response.items || []).length + " registered websites for token:");

        } else {

          // add a message that we found no websites
          textOutput.push('Did not find any registered websites');

        }

        // loop and add each website
        for(var i = 0; i < (response.items || []).length; i++) {

          // local reference
          var item = response.items[i];

          // sanity check
          if(!item) continue;

          // the output to add to the list
          var websiteOutput = [

            '#' + item.id + '\t' + item.domain

          ];

          // if we are currently crawling
          if(item.crawling) {

            websiteOutput.push(', currently testing <' + item.crawling.processed + '/' + item.crawling.pages + '>')

          } else if(item.crawl) {

            websiteOutput.push(', ' + item.crawl.count + ' issues found');

          }

          // add the details from the item
          textOutput.push(websiteOutput.join(''));

        }

        // set the output
        payload.setText(textOutput.join('\n'));
        payload.setJSON(response.items);

        // done
        fn(null);

      })

    });

  });

};
