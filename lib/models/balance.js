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
  var Balance = _.extend({}, require('./common')(params));

  /**
  * Returns the amount used for the billing run
  **/
  Balance.getUsed = function() { return params.used; };

  /**
  * Returns the total credit that was available his billing run
  **/
  Balance.getCount = function() { return params.count; };

  /**
  * Returns the current url of the Balance
  **/
  Balance.getAvailable = function() { return params.available; };

  // return the Balance object to use
  return Balance;

};
