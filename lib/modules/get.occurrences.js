/**
* Pull in required modules
**/
const API           = require('../api');
const Models        = require('../models');

// expose the acctual module
module.exports = exports = function(params, fn) {

  // get the websites from the api
  API.getOccurrences({

    uid:  params.uid

  }, function(err, report) {

    // handle a error
    if(err) return fn(err);

    // check if we got a page ... ?
    if(!report) return fn(null);

    // return the page class
    fn(null, Models.createIssue(report))

  });

};
