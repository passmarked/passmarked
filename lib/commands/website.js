// pull in our required modules
const config        = require('../config');
const api           = require('../api');
const S             = require('string');
const _             = require('lodash');

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // get the token variable
  var sections      = payload.getCommand().split(' ');
  var website       = sections[1] || null;

  // run the track
  api.track({

    key:      'website',
    message:  'Checking the website #' + website

  }, function(){

    // check if token is defined
    config.build(function(){

      // get the token
      var token = config.getToken();

      // we must have a token to execute this ...
      if(S(token).isEmpty() === true) {

        // output a error explaining what's happening
        payload.error('Passmarked CLI not authenticated.');

        // we're done here >:|
        return fn(new Error());

      }

      // check if the token was given ?
      if(S(website).isNumeric() === false) {

        // output a error explaining what's happening
        payload.error('Website id must be provided');

        // we're done here >:|
        return fn(null);

      }

      // set the actual content
      api.website({

        token:  token,
        id:     website

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

          // return a error
          return fn(err);

        }

        // find the website in our list
        var item = response.item;

        // did we find it ?
        if(!item) {

          // track
          return api.track({

            key:      'website.notfound',
            message:  'Unable to find the given website id #' + website

          }, function() {

            // output to stderr
            payload.error('Could not find a website with the domain of ' + website);

            // done
            fn(new Error())

          });

        }

        // the output to add to the list
        var websiteOutput = [

          'ID: ' + item.id,
          'Label: ' + item.label || '*No Set*',
          'Domain: ' + item.domain,
          'Created: ' + item.created,
          'LastUpdated: ' + item.lastupdated,

        ];

        // add the crawling info
        if(item.crawl) {

          // add the past crawl info
          websiteOutput.push('Last Crawl: ' + item.crawl.timestamp)
          websiteOutput.push('Issues: ' + item.crawl.issues)
          websiteOutput.push('Criticals: ' + item.crawl.criticals)
          websiteOutput.push('Errors: ' + item.crawl.errors)
          websiteOutput.push('Warnings: ' + item.crawl.warnings)
          websiteOutput.push('Notices: ' + item.crawl.notices)
          websiteOutput.push('Pages: ' + item.crawl.pages)

        } else {

          // add that we haven't done a crawl ...
          websiteOutput.push('Last Crawl: Never')

        }

        // add if we are currentl crawling
        websiteOutput.push('Currently Crawling: ' + (item.crawlingid != null ? 'Yes busy with #' + item.crawlingid : 'No' ));

        // add the crawling info
        if(item.crawlingid) {

          // add the past crawl info
          websiteOutput.push('Current Progress: ' + item.crawlingprocessed + '/' + item.crawlingpages);

        }

        // set the output
        payload.setText(websiteOutput.join('\n'));
        payload.setJSON(item);

        // done
        fn(null);

      });

    });

  });

};
