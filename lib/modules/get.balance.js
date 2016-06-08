/**
* Pull in required modules
**/
const API           = require('../api');
const Models        = require('../models');

// expose the acctual module
module.exports = exports = function(token, fn) {

  // get the websites from the api
  API.balance(token, function(err, balance) {

    // handle a error
    if(err) return fn(err);

    // check if we got a balance ... ?
    if(!balance) return fn(null);

    // return the balance class
    fn(null, Models.createBalance(balance))

  });

};
