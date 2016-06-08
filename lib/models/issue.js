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
  var Issue = _.extend({}, require('./common')(params));

  /**
  * Returns the current url of the Issue
  **/
  Issue.getLevel = function() { return params.level; };

  /**
  * Returns the weight for this issue
  **/
  Issue.getWeight = function() { return params.weight; };

  /**
  * Returns the count of pages this issue was present on
  **/
  Issue.getPageCount = function() {

    if(params.pages === null || params.pages === undefined)
      return 1;
    else
      return params.pages || 0;

  };

  /**
  * Returns the current url of the Issue
  **/
  Issue.getCount = function() { return params.count; };

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
