/**
* Pull in required modules
**/
const Constants     = require('../constants');
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const api           = require('../api');
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

    // get the vals
    var vals = _.values(arguments || {});

    // did we have any values
    if(vals.length > 0) {

      // loop and add the params
      if(Array.isArray(vals[0]) === false) {

        // set options
        options = _.extend({}, options, arguments[0] || {});

        // build the list of checks
        checks = buildCheckList(vals.slice(1, vals.length));

      } else {

        // build the list of checks
        checks = buildCheckList(vals);

      }

    }

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

    // check if the domain was given
    if(!data.url)
      msgs.push('No url is given, and it is required');

    // return them all
    if(fn)
      fn(null, msgs);

    // done
    return this;

  }

  /**
  * Returns the list of functions that will be to run.
  **/
  Runner.getRules = function() { return checks; };

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
            
            // check for a error
            if(err)
              reject(err);
            else
              resolve(payload);

            // return the callback if given
            if(fn) {

              if(err)
                fn(err);
              else
                fn(null, payload);

            }

          });

        });

      }
    );

    // return current object
    return runPromise;

  };

  // return the Runner object to use
  return Runner;

};
