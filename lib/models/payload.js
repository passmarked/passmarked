/**
* Pull in required modules
**/
const Constants     = require('../constants');
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const S             = require('string');
const querystring   = require('querystring');

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * The Report object to return that we can use
  **/
  var Payload = _.extend({}, require('./common')(params));

  // handle the payload object
  Payload.addRule = function(rule, occurence) {};

  // handle the payload object
  Payload.getRules = function() { return []; };

  // return the Payload object to use
  return Payload;

};
