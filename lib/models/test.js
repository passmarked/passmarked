/**
* Pull in required modules
**/
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const S             = require('string');

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * The Test object to return that we can use
  **/
  var Test = {};

  /**
  * Returns the JSON string of the issue
  **/
  Test.toString() = function() { return JSON.stringify(this.toJSON()) };

  /**
  * Returns JSON object that can be used
  **/
  Test.toJSON = function() { return params; };

  /**
  * Returns the current url of the Test
  **/
  Test.getDomain = function() { return params.domain; };

  // return the Test object to use
  return Test;

};
