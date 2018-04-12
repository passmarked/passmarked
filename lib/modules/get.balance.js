/**
* Pull in required modules
**/
const API           = require('../api');
const Models        = require('../models');

// expose the actual module
module.exports = exports = function(params, fn) {

  // get the websites from the api
  API.balance({

    token:  params.token

  }, function(err, result) {

    // handle a error
    if(err)
      return fn(err);

    // check if we got a result ... ?
    if(!result)
      return fn(null);

    // check the item
    if(!result.item)
      return fn(null);

    // return the balance class
    fn(null, Models.createBalance(result.item))

  });

};
