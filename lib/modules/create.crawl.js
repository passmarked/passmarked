/**
* Pull in required modules
**/
const EventEmitter  = require('events');

module.exports = exports = function(params) {

  /**
  * The Report object to return that we can use
  **/
  var Crawl = new EventEmitter();

  /**
  * Set our local parameters to use
  **/
  Crawl.token      = params.token;
  Crawl.websiteid  = params.websiteid;

  /**
  * Start the Crawl
  **/
  Crawl.start    = function(fn) {

    fn(null);

  };

  // return the Crawl object to use
  return Crawl;

};
