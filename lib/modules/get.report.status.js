/**
* Pull in required modules
**/
const API           = require('../api');
const Models        = require('../models');

// expose the acctual module
module.exports = exports = function(key, fn) {

  // get the websites from the api
  API.getStatusOfReport(key, function(err, page) {

    // handle a error
    if(err) return fn(err);

    // check if we got a page ... ?
    if(!page) return fn(null);

    // return the page class
    fn(null, Models.createPage(page))

  });

};
