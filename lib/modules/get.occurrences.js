/**
* Pull in required modules
**/
const API           = require('../api');
const Models        = require('../models');

// expose the actual module
module.exports = exports = function(params, fn) {

  // get the websites from the api
  API.getOccurrences(params, function(err, response) {

    // was this a success ?
    if(err) return fn(err);
    if((response || {}).status != 'ok') {

      // emulate a error
      return fn(new Error('Got error code ' + response.code + ' from Passmarked servers'));

    }

    // the entries
    var entries = [];

    // loop and create occurrences for each
    for(var i = 0; i < (response.items || []).length; i++) {

      // add it
      entries.push(Models.createOccurrence(response.items[i]));

    }

    // done
    fn(err, entries);

  });

};
