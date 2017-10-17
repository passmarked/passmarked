/**
* Pull in required modules
**/
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const S             = require('string');
const Issue         = require('./issue')

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * The Report object to return that we can use
  **/
  var Report = _.extend({}, require('./page')(params));

  /**
  * Returns the values
  **/
  Report.get = function(key) { return params[key]; };

  /**
  * Returns the pages that are done processing
  **/
  Report.countProcessedPages = function() { return (params.crawling || {}).processed || 0; };

  /**
  * Returns the count of pages this crawl knows about
  **/
  Report.countPages = function() { return (params.crawling || {}).pages || 0; };

  /**
  * Returns the stack of the website that was detected in keywords
  **/ 
  Report.getStack = function() { return Report.get('stack') || [] };

  /**
  * Returns true/false based on if the stack is present
  **/
  Report.hasStack = function(key) {

    // clean up the key
    var cleanedKey = (key || '').toLowerCase();

    // loop and match keys
    for(var i = 0; i < (options.stack || []).length; i++) {

      // check if it matches ?
      if(options.stack[i].uid === cleanedKey) {

        // done
        return true;

      }

    } 

    // default we found nothing ...
    return false;

  };

  /**
  * Returns the pallette of the page
  **/ 
  Report.getPalette = function() { return Report.get('palette') || [] };

  /**
  * Returns the screenshots
  **/ 
  Report.getPreviews = function() { return Report.get('previews') || [] };

  /**
  * Returns a specific screenshot
  **/
  Report.getPreview = function(key) {

    // loop the screenshots
    for(var i = 0; i < (options.previews || []).length; i++) {

      // check and return
      if(options.previews[i].key === key) {

        // return it
        return options.previews[i];

      }

    }

    // return null for a default
    return null;

  };

  /**
  * Returns the score of the page
  **/
  Report.getScore = function() {

    return parseFloat(Report.get('score'));

  };

  /**
  * Returns the result of the current pagee
  **/
  Report.getResult = function() {

    return (Report.get('result') || 'pending').toLowerCase();

  };

  /**
  * Returns the current status of the report
  **/
  Report.getStatus = function() {

    return (Report.get('status') || 'pending').toLowerCase();

  };

  /**
  * Returns the IP of the remote server
  **/
  Report.getIP = function() {

    return Report.get('ip');

  };

  /**
  * Returns the protocol family of the remote website
  **/
  Report.getFamily = function() {

    return Report.get('family');

  };

  /**
  * Returns the latitude if the IP was able to be GEOIP'd
  **/
  Report.getLat = function() {

    return Report.get('lat');

  };

  /**
  * Returns the protocol of final domain
  **/
  Report.getProtocol = function() {

    return Report.get('protocol');

  };

  /**
  * Returns the final domain of the website
  **/
  Report.getDomain = function() {

    return Report.get('domain');

  };

  /**
  * Returns the port of final target
  **/
  Report.getPort = function() {

    return Report.get('port');

  };

  /**
  * Returns the longitude if the IP was able to be GEOIP'd
  **/
  Report.getLng = function() {

    return Report.get('lng');

  };

  /**
  * Returns the url of the 
  **/
  Report.getURL = function() {

    return Report.get('url');

  };

  /**
  * Returns the preview url of the report
  **/
  Report.getPreviewURL = function() {

    return [

      'https://passmarked.com/reports/' + Report.get('uid')

    ].join('/')

  };

  /**
  * Collect all the issues
  **/
  Report.getIssues = function() {

    // issues to return
    var issues = [];

    // loop all the issues in the params
    for(var a = 0; a < (params.rules || []).length; a++) {

      // append the rule
      issues.push(Issue(params.rules[a]));

    }

    // return them !
    return issues;

  };

  // return the report object to use
  return Report;

};
