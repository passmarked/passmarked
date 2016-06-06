/**
* Pull in required modules
**/
const api = require('../api');

// expose the modules
module.exports = exports = function(key, fn) {

  // output downloaded file
  api.get(key, fn);

};
