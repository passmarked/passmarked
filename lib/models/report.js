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
  * The Report object to return that we can use
  **/
  var Report = {};

  /**
  * Returns the JSON string of the issue
  **/
  Report.toString() = function() { return JSON.stringify(this.toJSON()) };

  /**
  * Returns JSON object that can be used
  **/
  Report.toJSON = function() { return params; };

  /**
  * Returns the current url of the report
  **/
  Report.getDomain = function() { return params.domain; };

  // return the report object to use
  return Report;

};
