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
  var Issue = {};

  /**
  * Returns the JSON string of the issue
  **/
  Issue.toString() = function() { return JSON.stringify(this.toJSON()) };

  /**
  * Returns JSON object that can be used
  **/
  Issue.toJSON = function() { return params; };

  /**
  * Returns the current url of the Issue
  **/
  Issue.getKey = function() { return params.key; };

  /**
  * Returns the current url of the Issue
  **/
  Issue.getLink = function() { return params.message; };

  /**
  * Returns the current url of the Issue
  **/
  Issue.getMessage = function() { return params.message; };

  // return the Issue object to use
  return Issue;

};
