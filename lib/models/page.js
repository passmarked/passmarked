/**
* Pull in required modules
**/
const Constants     = require('../constants');
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const os            = require('os');
const S             = require('string');
const Issue         = require('./issue');
const querystring   = require('querystring');

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * The Report object to return that we can use
  **/
  var Page = _.extend({}, require('./common')(params));

  /**
  * Return the preview url for the report
  **/
  Page.getPreviewUrl = function(tracking) {

    // if blank just return to homepage
    if(S(params.uid).isEmpty() === true) return Constants.WEB_URL;

    // done
    var previewUrl = [

      Constants.WEB_URL,
      'reports',
      params.uid

    ].join('/');

    // check if we should add tracking
    if(tracking !== undefined && 
        tracking === true) {

      // set it
      previewUrl = previewUrl + '?' + querystring.stringify({

        source:   'terminal',
        device:   os.platform(),
        appname:  Constants.SOURCE,
        version:  Constants.VERSION

      })

    }

    // done
    return previewUrl;

  };

  /**
  * Returns the pages that are done processing
  **/
  Page.countPendingTests = function() { return params.processed || 0; };

  /**
  * Returns the count of pages this crawl knows about
  **/
  Page.countTests = function() { return (params.tests || []).length; };

  /**
  * Collect all the issues
  **/
  Page.getIssues = function() {

    // issues to return
    var issues = [];

    // loop the tests and their rules
    for(var i = 0; i < (params.issues || []).length; i++) {

      // append the rule
      issues.push(Issue(params.issues[i]));

    }

    // return them !
    return issues;

  };

  /**
  * Returns the tests in this page
  **/
  Page.getTests = function() { params.tests || []; };

  /**
  * Returns the UID of the report for the page
  **/
  Page.getUID = function() { return params.uid; };

  /**
  * Returns the current status of the report
  **/
  Page.getStatus = function() { return params.status; };

  /**
  * Returns the result of the page after being tested
  **/
  Page.getResult = function() { return params.result; };

  /**
  * Returns the score of the page
  **/
  Page.getScore = function() { return params.score; };

  /**
  * Returns the current url of the Page
  **/
  Page.getURL = function() { return params.url; };

  /**
  * Returns the domain of the crawl target
  **/
  Page.getDomain = function() { return params.domain; };

  // return the Page object to use
  return Page;

};
