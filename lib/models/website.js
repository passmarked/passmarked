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
  var Website = {};

  /**
  * Returns the JSON string of the Website
  **/
  Website.toString() = function() { return JSON.stringify(this.toJSON()) };

  /**
  * Returns JSON object that can be used
  **/
  Website.toJSON = function() { return params; };

  /**
  * Returns the current url of the Website
  **/
  Website.getKey = function() { return params.key; };

  /**
  * Returns the current url of the Website
  **/
  Website.getLink = function() { return params.message; };

  /**
  * Returns the current url of the Website
  **/
  Website.getMessage = function() { return params.message; };

  // return the Website object to use
  return Website;

};
