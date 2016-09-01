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
* Builds the list of bootstrap functions
**/
var buildBootstrapList = function(modules) {

  // list to build up
  var checks  = [];

  // loop the given modules
  for(var i = 0; i < (modules || []).length; i++) {

    // flatten and add each of the checks
    if(modules[i].bootstrap) {

      // add it
      checks.push(modules[i].bootstrap);

    }

  }

  // done
  return checks;

};

/**
* Builds a list of checks from the given array
**/
var buildCheckList = function(modules) {

  // list to build up
  var checks  = [];

  // loop the given modules
  for(var i = 0; i < (modules || []).length; i++) {

    // create local variables
    var execFunc = modules[i];

    // flatten and add each of the checks
    if(util.isFunction(execFunc)) {

      // assign the functions
      execFunc.getKey             = execFunc.getKey;
      execFunc.getTest            = execFunc.getTest;
      execFunc.getCategory        = execFunc.getCategory;
      execFunc.getVersion         = execFunc.getVersion;

      // add the check
      checks.push(execFunc);

    } else if(util.isArray(execFunc)) {

      // loop and add the array
      for(var a = 0; a < (execFunc || []).length; a++) {

        // the local reference
        var execRuleFunc = execFunc[a];

        // assign the functions
        execRuleFunc.getKey       = execFunc.getKey;
        execRuleFunc.getTest      = execFunc.getTest;
        execRuleFunc.getCategory  = execFunc.getCategory;
        execRuleFunc.getVersion   = execFunc.getVersion;

        if(util.isFunction(execRuleFunc)) {

          // add each
          checks.push(execRuleFunc);

        } else {

          // throw a error
          throw new Error(execRuleFunc + ' must be either a function or array of functions');

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
  var boostraps = [];
  var queue     = null;
  var loaded    = false;
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
        checks =    buildCheckList(vals.slice(1, vals.length));
        boostraps = buildBootstrapList(vals.slice(1, vals.length));

      } else {

        // build the list of checks
        checks    = buildCheckList(vals);
        boostraps = buildBootstrapList(vals);

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
  * Bootstraps all the rules
  **/
  Runner.bootstrap = function(fn) {

    // if not already loaded
    if(loaded === true) return fn(null);

    // bootstrap it
    async.each(boostraps, function(boostrap, cb) {

      // run the bootstrap
      boostrap(cb);

    }, function(err) {

      // done
      loaded = true;

      // finish
      fn(err);

    });

  };

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

          // first bootstrap
          Runner.bootstrap(function() {

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

              // try to track
              Runner.track(payload, function() {
              
                // check for a error
                if(err) {
                  reject(err);
                } else {
                  resolve(payload);
                }

                // return the callback if given
                if(fn) {

                  if(err) {
                    fn(err);
                  } else {
                    fn(null, payload);
                  }

                }

              });

            });

          });

        });

      }
    );

    // return current object
    return runPromise;

  };

  /**
  * Reports back the information to Passmarked if configured,
  * this helps us provide useful information about external tests
  * along with tests run locally which anyone can run without talking
  * to our system to check pages/sites. The information is anonymised
  * before storing as analytical data for reporting usage
  **/
  Runner.track = function(payload, fn) {

    // disables reporting
    if(options.reporting === undefined || 
        options.reporting === null || 
          options.reporting === true) {

      // get the data
      var data    = payload.getData();
      var rules   = payload.getRules();

      /**
      * Parse the URL
      **/
      var uri     = url.parse(data.url);

      /**
      * Look up the DNS
      **/
      dns.lookup(uri.hostname, function(err, address, family) {

        // check for a error
        if(err) {

          // finish
          return fn(err);

        }

        // the list of checks and tests
        var checks  = [];
        var tests   = [];

        // loop the rules
        for(var i = 0; i < (rules || []).length; i++) {

          // add the check
          checks.push({

            type:       rules[i].type,
            count:      rules[i].count,
            uid:        rules[i].uid,
            message:    rules[i].message

          })

        }

        // create the params
        var payloadParams = {

          url:      data.url,
          servers:  dns.getServers(),
          ip:       address,
          family:   'IPV' + family,
          rules:    checks,
          tests:    tests

        };

        // check if the token is defined
        if(options.token) {

          // add the token
          payloadParams.token = options.token;

        }

        // send out the reporting
        api.result(payloadParams, function() {

          // finish
          fn(null);

        });

      });

    } else {

      // just stop
      fn(null);

    }

  };

  // return the Runner object to use
  return Runner;

};
