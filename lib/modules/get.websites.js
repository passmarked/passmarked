/**
* Pull in required modules
**/
const API           = require('../api');
const Models        = require('../models');

// expose the actual module
module.exports = exports = function(key, fn) {

  // get the websites from the api
  API.websites(key, function(err, websites) {

    // handle a error
    if(err) return fn(err);

    // check if we got a websites ... ?
    if(!websites) return fn(null);

    // list of websites to return
    var parsedWebsites = [];

    // loop all the websites
    for(var i = 0; i < (websites || []).length; i++) {

      // add the websites
      parsedWebsites.push( Models.createwebsites(websites[i]) )

    }

    // done
    fn(null, parsedWebsites);

  });

};
