/**
* Pull in required modules
**/
const EventEmitter  = require('events');

module.exports = exports = function(params) {

  /**
  * The Report object to return that we can use
  **/
  var Report = new EventEmitter();

  /**
  * Set our local parameters to use
  **/
  Report.token    = params.token;
  Report.url      = params.url;

  /**
  * Start the report
  **/
  Report.start    = function(fn) {

    fn(null);

  };

  // return the report object to use
  return Report;

};
