/**
* Pull in required modules
**/
const Constants     = require('../constants');
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const S             = require('string');
const querystring   = require('querystring');

/**
* Parses out our functions to use
**/
var parseVariablesFromParams = function(params) {

  // the vars
  var opts = {};

  // add the content
  opts.content = params.body || null;

  // set the data from the payload with defaults
  opts.data = _.extend({}, {

    stack:    []

  }, params || {}, {

    har:      null,
    body:     null,
    uri:      url.parse(params.url)

  });

  // parse the HAR
  opts.har = null;

  // check the type
  if(Object.prototype.toString.call(params.har || '').toLowerCase() 
      === '[object string]') {

    // try to parse the JSON
    try {

      opts.har = JSON.parse(params.har);

    } catch(err) { /** don't care **/ }

  } else {

    // define as HAR
    opts.har = params.har;

  }

  // returns the final opts
  return opts;

};

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * The Report object to return that we can use
  **/
  var Payload = _.extend({}, require('./common')(params));

  /**
  * Build our list of local functions
  **/
  var options = parseVariablesFromParams(params);

  /**
  * Keeps track of the existing URLS
  **/
  var rules = {};

  /**
  * The list of rules
  **/
  var logs = [];

  /**
  * Counts we keep track of
  **/
  var ruleCount = 0;

  /**
  * Returns the count of rules, this includes rules
  * that may have been skipped to save on size.
  **/
  Payload.getRuleCount = function(fn) {

    // check the callback
    if(fn) {

      // done
      return fn(null, ruleCount);

    }

    // return as a normal return
    return ruleCount;

  };

  /**
  * Returns the count of rules, this includes rules
  * that may have been skipped to save on size.
  **/
  Payload.getCount = Payload.getRuleCount;

  /**
  * Returns the logs that have been built
  **/
  Payload.getLogs = function() { return logs; };

  /**
  * Handles debugging messages
  **/
  Payload.debug = function(message) {

    // add to the logs
    logs.push({

      type:       'debug',
      message:    message,
      timestamp:  new Date().getTime()

    });

  };

  /**
  * Handles information messages
  **/
  Payload.info = function(message) {

    // add to the logs
    logs.push({

      type:       'info',
      message:    message,
      timestamp:  new Date().getTime()

    });

  };

  /**
  * Handles and warnings that might be present
  **/
  Payload.warning = function(message) {

    // add to the logs
    logs.push({

      type:       'warning',
      message:    message,
      timestamp:  new Date().getTime()

    });

  };

  /**
  * Handles logging error outputs
  **/
  Payload.error = function(message, err) {

    // add to the logs
    logs.push({

      type:       'error',
      message:    message,
      error:      err,
      timestamp:  new Date().getTime()

    });

  };

  /**
  * Should this rule be given another chance to run ?
  **/
  var markedAsRetry = false;

  /**
  * 
  **/
  Payload.markRetry = function() {};

  /**
  * Returns the stack keys that were present
  **/
  Payload.getStack = function(fn) {

    // return the current instance
    return (options.data || {}).stack || '';

  };

  /**
  * Returns the target URL of the data
  **/
  Payload.getURI = function(fn) {

    // return the current instance
    return (options.data || {}).uri;

  };

  /**
  * Returns the target URL of the data
  **/
  Payload.getURL = function(fn) {

    // return the current instance
    return (options.data || {}).url;

  };

  /**
  * Returns the given payload
  **/
  Payload.getData = function(fn) {

    // return the current instance
    return options.data;

  };

  /**
  * Returns the HAR from the payload
  **/
  Payload.getHAR = function(fn) {

    // get the har
    var har = options.har;

    // check the har
    if(har) {

      // returns the har
      fn(null, har);

    } else {

      // returns the har
      fn(new Error('Har was not able to be parsed'));

    }

    // return the current instance
    return this;

  };

  /**
  * Returns the page content as given
  **/
  Payload.getPageContent = function(fn) {

    // get the content
    var content = options.content;

    // return the body
    if(content) {

      // returns the callback
      fn(null, content);

    } else {

      // returns the har
      fn(new Error('Page content was undefined'));

    }

    // returns the current instance
    return this;

  };

  /**
  * Adds a rule to the payload
  **/
  Payload.addRule = function(params, occurrence, fn) {

    // check if the defaults were given ...
    if(params && 
          params.type && 
            params.key && 
              params.message) {

      // increment the rule count
      ruleCount++;

      // create the rule details
      var rule = _.extend({}, params || {});

      // define the type
      var type = null;

      // check the type
      if(params.type == 'ok') {
        type = 'notice'
      } else if(params.type == 'notice') {
        type = 'notice'
      } else if(params.type == 'warning') {
        type = 'warning'
      } else if(params.type == 'error') {
        type = 'error'
      } else if(params.type == 'critical') {
        type = 'critical'
      }

      // only if the type was defined
      if(type) {

        // should we create the rule ?
        if(!rules[ params.key ]) {

          // create the rule object
          rules[ params.key ] = rule;

        }

        // update the count
        var currentCount = 1 * (rules[ params.key ].count || 0);
        rules[ params.key ].count = currentCount + 1;

        // check the occurrence
        if(occurrence) {

          // is the occurence defined
          if(rules[ params.key ].occurrences) {

            // must be smaller than a 100
            if(rules[ params.key ].occurrences.length <= 500) {

              // push to array
              rules[ params.key ].occurrences.push( occurrence ); 

            }   

          } else {

            // create a new array
            rules[ params.key ].occurrences = [ occurrence ];

          }

        }

      }

    }

    // handle a callback if any
    if(fn) fn(null);

    // return the current instance
    return this;

  };

  /**
  * Returns the parsed Rules
  **/
  Payload.getRules = function() { return _.values(rules); };

  // return the Payload object to use
  return Payload;

};
