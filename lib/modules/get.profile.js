/**
* Pull in required modules
**/
const api = require('../api');

// expose the acctual module
module.exports = exports = function(token, fn) {

  // get the websites from the api
  api.me(token, fn);

};
