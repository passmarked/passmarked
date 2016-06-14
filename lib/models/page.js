/**
* Pull in required modules
**/
const Constants     = require('../constants');
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
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
  Page.getPreviewUrl = function() {

    // get the UID
    var uid       = params.uid || '';
    var domain    = params.domain || '';

    if(uid === '') return Constants.WEB_URL + '/websites';

    return [

      Constants.WEB_URL,
        domain,
          uid.slice(0, 4),
            uid.slice(4, 6),
              uid

    ].join('/') + '?' + querystring.stringify({

      source: Constants.SOURCE

    });

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
    for(var i = 0; i < (params.tests || []).length; i++) {

      // get a local ref
      var test = params.tests[i];

      // loop all the rules in the test
      for(var a = 0; a < (test.rules || []).length; a++) {

        // append the rule
        issues.push(Issue(test.rules[a]));

      }

    }

    // return them !
    return issues;

  };

  /**
  * Returns the UID of the report for the page
  **/
  Page.getUID = function() { return params.uid; };

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
