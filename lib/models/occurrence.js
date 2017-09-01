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
  var Occurrence = _.extend({}, require('./common')(params));

  /**
  * Returns the message of the occurrence
  **/
  Occurrence.getMessage = function(format) {

    if(format === true) {

      var message       = '' + params.message;
      var identifiers   = Occurrence.getIdentifiers();
      for(var i = 0; i < identifiers.length; i++){

        // replace placeholders
        message = message.replace('$', identifiers[i]);

      }
      return message;

    } else {

      return params.message;

    }

  };

  /**
  * Returns the identifiers of the occurrence
  **/
  Occurrence.getIdentifiers = function() { return params.identifiers || []; };

  /**
  * Returns the href from the page of the occurrence
  **/
  Occurrence.getWeight = function() { return params.weight; };

  /**
  * Returns the href from the page of the occurrence
  **/
  Occurrence.getImpact = function() { return params.impact; };

  /**
  * Returns the href from the page of the occurrence
  **/
  Occurrence.getRule = function() { return params.rule; };

  /**
  * Returns the page of the occurrence
  **/
  Occurrence.getPage = function() { return params.page; };

  /**
  * Returns the category of the occurrence
  **/
  Occurrence.getCategory = function() { return params.category; };

  /**
  * Returns the test of the occurrence
  **/
  Occurrence.getTest = function() { return params.test; };

  /**
  * Returns the uid of the occurrence
  **/
  Occurrence.getUID = function() { return params.uid; };

  /**
  * Returns the url of the occurrence if any
  **/
  Occurrence.getURL = function() { return params.url; };

  /**
  * Returns the display type of the occurrence
  **/
  Occurrence.getDisplay = function() { return params.display; };

  /**
  * Returns the code object of the occurrence
  **/
  Occurrence.getCode = function() { return params.code; };

  /**
  * Returns the ssl chain of the object if any
  **/
  Occurrence.getSSLChain = function() { return params.chain; };

  // return the Occurrence object to use
  return Occurrence;

};
