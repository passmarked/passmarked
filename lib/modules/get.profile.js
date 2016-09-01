/**
* Pull in required modules
**/
const API           = require('../api');
const Models        = require('../models');

// expose the acctual module
module.exports = exports = function(token, fn) {

  // get the websites from the api
  API.user({

    token: token

  }, function(err, result) {

    // handle a error
    if(err) return fn(err);

    // check if we got a result ... ?
    if(!result) return fn(null);

    // return the result class
    fn(null, Models.createUser(result.item))

  });

};
