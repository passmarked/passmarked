/**
* Pull in required modules
**/
const API           = require('../api');
const Models        = require('../models');

// expose the acctual module
module.exports = exports = function(token, fn) {

  // get the websites from the api
  API.me(token, function(err, profile) {

    // handle a error
    if(err) return fn(err);

    // check if we got a profile ... ?
    if(!profile) return fn(null);

    // return the profile class
    fn(null, Models.createUser(profile))

  });

};
