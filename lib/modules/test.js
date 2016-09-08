/**
* Pull in required modules
**/
const Constants     = require('../constants');
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const os            = require('os');
const S             = require('string');
const querystring   = require('querystring');

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * The Test object to return that we can use
  **/
  var Test = [];

  /**
  * Adds the array of tests if given
  **/ 
  if(Array.isArray(params.rules || []) === true) {

    // concat our list

  }

  /**
  * Get the sections of the key
  **/
  var sections = (params.key || '').split('.');

  /**
  * Defines the options we can use
  **/
  Test.getKey = function() {

    // returns the key
    return params.key;

  };

  /**
  * Returns the defined test key
  **/
  Test.getTest = function() {

    // returns the key
    return params.test || sections[1] || 'unknown';

  };

  /**
  * Returns the defined category key
  **/
  Test.getCategory = function() {

    // returns the key
    return params.category || sections[0] || 'unknown';

  };

  /**
  * Returns the current version of the test
  **/
  Test.getVersion = function() {

    // done
    return params.version || null;

  };

  /**
  * Runs on boot for the test
  **/
  Test.bootstrap = function(logger, fn) {

    // just finish for now
    fn(null);

  };

  // return the Test object to use
  return Test;

};
