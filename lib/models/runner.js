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
const util          = require('util');
const Payload       = require('./payload');

/**
* Builds a list of checks from the given array
**/
var buildCheckList = function(modules) {

  // list to build up
  var checks  = [];

  // loop the given modules
  for(var i = 0; i < (modules || []).length; i++) {

    // flatten and add each of the checks
    if(util.isFunction(modules[i])) {

      // add the check
      checks.push(modules[i]);

    } else if(util.isArray(modules[i])) {

      // loop and add the array
      for(var a = 0; a < (modules[i] || []).length; a++) {

        if(util.isFunction(modules[i][a])) {

          // add each
          checks.push(modules[i][a]);

        } else {

          // throw a error
          throw new Error(modules[i][a] + ' must be either a function or array of functions');

        }

      }

    } else {

      // throw a error
      throw new Error(modules[i] + ' must be either a function or array of functions');

    }

  }

  // done
  return checks;

};

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function() {

  /**
  * Internal params to use
  **/
  var checks    = [];
  var queue     = null;
  var options   = {

    timeout:  1000 * 30

  };

  /**
  * Build the list of checks
  **/
  try {

    // build the list of checks
    checks = buildCheckList(_.values(arguments));

  } catch(err) {

    // stop exec here and return error
    throw err;

    // stop exec
    return;

  }

  /**
  * The Report object to return that we can use
  **/
  var Runner = _.extend({}, require('./common')({}));

  /**
  * Validates a given set of data
  **/
  Runner.validate = function(data, fn) {

    // msgs to return
    var msgs = [];

    // return them all
    if(fn)
      fn(null, msgs);

    // done
    return this;

  }

  /**
  * Returns the list of functions that will be to run.
  **/
  Runner.getChecks = function() { return checks; };

  /**
  * Run the requested checks
  **/
  Runner.run = function(data, fn) {

    /**
    * Start our promise
    **/
    var runPromise = new Promise(
      function(resolve, reject) {

        // validate the data first
        Runner.validate(data, function(err, msgs) {

          // check for a error
          if(err) {

            // reject or fail
            reject(err);
            if(fn) fn(err);

            // stop exec
            return;

          }

          // check for a error
          if((msgs || []).length > 0) {

            // reject or fail
            reject(new Error(msgs[0]));
            if(fn) fn(new Error(msgs[0]));

            // stop exec
            return;

          }

          // create the payload to use
          var payload = Payload(data);

          // loop and run the params
          async.each(checks, function(moduleFunc, cb) {

            // define the timer
            var timer     = null;
            var started   = new Date().getTime();

            // the callback once done
            var callback = _.once(function(err){

              // clear the timeout
              clearTimeout(timer);

              // and free from memory
              timer = null;

              // done
              var ended = new Date().getTime();

              // if over the time
              if((ended - started) > options.timeout) {

                // this timed out
                cb(new Error('TIMEOUT'));

              } else {

                // all good :)
                cb(null);

              }

            });

            // timeout to wait for
            timer = setTimeout(callback, options.timeout);

            // run each function
            moduleFunc(payload, callback);

          }, function(err) {

            // get the results
            var rules = payload.getRules();

            // check for a error
            if(err)
              reject(err);
            else
              resolve(rules);

            // return the callback if given
            if(err)
              fn(err);
            else
              fn(null, rules);

          });

        });

      }
    );

    // return current object
    return runPromise;

  };

  /**
  * Returns the configured timeout
  **/
  Runner.getTimeout = function() { return options.timeout; };

  /**
  * Configure the timeout
  **/
  Runner.setTimeout = function(timeout) {

    // set the timeout option
    options.timeout = timeout;

    // return current object
    return this;

  };

  // return the Runner object to use
  return Runner;

};
