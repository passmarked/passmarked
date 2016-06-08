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
  * Returns the pages that are done processing
  **/
  Report.countProcessedPages = function() { return params.processed || 0; };

  /**
  * Returns the count of pages this crawl knows about
  **/
  Report.countPages = function() { return params.pages || 0; };

  /**
  * Collect all the issues
  **/
  Report.getIssues = function() {

    // issues to return
    var issues = [];

    // loop all the rules in the params
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
