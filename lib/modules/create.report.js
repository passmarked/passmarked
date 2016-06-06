/**
* Pull in required modules
**/
const EventEmitter  = require('events');
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const S             = require('string');

const Validate      = require('../utils/validate');
const LANG          = require('../../lang/en.json');

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * The Report object to return that we can use
  **/
  var Report = new EventEmitter();

  /**
  * Set our local parameters to use
  **/
  Report.config     = _.extend({

    recursive:  false,
    bail:       false,
    url:        null,
    token:      null,
    limit:      null,
    patterns:   []

  }, params);

  /**
  * Returns the list of patterns we should use
  **/
  Report.getPatterns = function() { return (this.config || {}).patterns || []; }

  /**
  * Returns the limit of pages to check in this crawl
  **/
  Report.getLimit = function() { return (this.config || {}).limit || null; }

  /**
  * Returns the token used for this request
  **/
  Report.getToken = function() { return (this.config || {}).token || null; }

  /**
  * Returns true if this is recursive, IE "crawl"
  **/
  Report.isRecursive = function() { return (this.config || {}).recursive === true; }

  /**
  * Returns true if configured to bail after a error
  **/
  Report.isBail = function() { return (this.config || {}).bail === true; }

  /**
  * Returns the URL that this report was created on
  **/
  Report.getURL = function() { return (this.config || {}).url || null; }

  /**
  * Validates the passed domain, must be a valid domain
  **/
  Report.validateTarget = function(target, fn) {

    // first check if a ip ... ?
    Validate.isIP(target, function(err, result) {

      // error ?
      if(err) return fn(err, false);

      // output result
      if(result === true) {

        // check if not local
        return Validate.isLocalIP(target, function(err, result) {

          // done with error
          if(err) return fn(err);

          // check if we got a result
          if(result === true)
            return fn(new Error(LANG.ERROR_IP_LOCALHOST));

          // all good
          fn(null);

        });

      }

      // add the target
      var cleanedTarget = (target || '').toLowerCase();
      if( S(cleanedTarget).startsWith("http://") === false &&
            S(cleanedTarget).startsWith("https://") === false )
              cleanedTarget = 'http://' + cleanedTarget;

      // parse the url
      var parsedUrl = url.parse(cleanedTarget);

      // must be defined
      if(!parsedUrl) return fn(new Error(LANG.ERROR_INVALID_DOMAIN));

      // get domain path
      Validate.isDomain(parsedUrl.hostname, function(err, result, address) {

        // check if we got a error
        if(err) return fn(err);

        // check if we found it
        if(result === false) return fn(new Error(LANG.ERROR_IP_LOCALHOST));

        // validate the address
        Validate.isLocalIP(address, function(err, result) {

          // done with error
          if(err) return fn(err);

          // check if we got a result
          if(result === true)
            return fn(new Error(LANG.ERROR_IP_LOCALHOST));

          // all good
          fn(null);

        });

      });

    });

  };

  /**
  * Start the report
  **/
  Report.start    = function(fn) {

    // sanity check if we found a callback
    if(!fn)
      throw new Error(LANG.ERROR_CALLBACK_REQUIRED);

    // check if this is a crawl, with no token ...
    if(this.isRecursive() && this.getToken() === null) {
      fn(new Error(LANG.ERROR_RECURSIVE_TOKEN));
      return this;
    }

    // validate the domain
    this.validateTarget(this.getURL(), function(err) {

      // did we get a error ?
      if(err)
        return fn(err);

      // all good, run this report
      fn(null);

    });

    // return our instance
    return this;

  };

  // return the report object to use
  return Report;

};
