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
  var Balance = {};

  /**
  * Returns the JSON string of the Balance
  **/
  Balance.toString() = function() { return JSON.stringify(this.toJSON()) };

  /**
  * Returns JSON object that can be used
  **/
  Balance.toJSON = function() { return params; };

  /**
  * Returns the current url of the Balance
  **/
  Balance.getKey = function() { return params.key; };

  /**
  * Returns the current url of the Balance
  **/
  Balance.getLink = function() { return params.message; };

  /**
  * Returns the current url of the Balance
  **/
  Balance.getMessage = function() { return params.message; };

  // return the Balance object to use
  return Balance;

};
