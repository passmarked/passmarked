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
      payload.error('Passmarked CLI not authenticated.');

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

          '* ' + item.domain

        ];

        // if we are currently crawling
        if(item.crawlingid) {

          websiteOutput.push(', currently testing <' + item.crawlingprocessed + '/' + item.crawlingpages + '>')

        } else if(item.crawl) {

          websiteOutput.push(', ' + item.crawl.issues + ' issues found');

        }

        // output details

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
