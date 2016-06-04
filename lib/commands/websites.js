// pull in our required modules
const config        = require('../config');
const api           = require('../api');
const S             = require('string')

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked me requested');

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
      payload.error('***************\n\nPassmarked CLI not authenticated, please run `passmarked connect` \nto request a token, or `passmarked token <token>` to set a token \ncopied from passmarked.com\n\n***************');

      // we're done here >:|
      return fn(new Error());

    }

    // set the actual content
    api.websites(token, function(err, response) {

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

          '-> (#' + item.id + ') ' + (item.label || item.domain)

        ];

        // if we are currently crawling
        if(item.crawlingid) {

          websiteOutput.push(', currently testing <' + item.crawlingprocessed + '/' + item.crawlingpages + '>')

        } else if(item.crawl) {

          websiteOutput.push(', ' + item.crawl.issues + ' issues found');

        }

        // output details

        /**

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

        **/

        // add the details from the item
        textOutput.push(websiteOutput.join(''));

      }

      // set the output
      payload.setText(textOutput.join('\n'));
      payload.setJSON(response.items);

      // done
      fn(null);

    });

  });

};
