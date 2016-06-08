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
  var Website = _.extend({}, require('./common')(params));

  /**
  * Returns the ID of the website
  **/
  Website.getID = function() { return params.id; };

  /**
  * Returns the current status of the website's crawl to provide updates
  **/
  Website.getCrawlingProgress = function() { return {

    processed:  params.crawlingprocessed,
    pages:      params.crawlingpages,
    uid:        params.crawlingid

  }; };

  /**
  * Returns if the website is currently being crawled
  **/
  Website.isCrawling = function() { return params.crawlingid !== null; };

  /**
  * Returns information about the last crawl of the website
  **/
  Website.getLastCrawl = function() { return params.crawl || null; };

  /**
  * Returns when the website was added to the list
  **/
  Website.getCreated = function() { return params.created; };

  /**
  * Returns the last time the website was updated
  **/
  Website.getLastUpdated = function() { return params.lastupdated; };

  /**
  * Returns the domain from the website
  **/
  Website.getDomain = function() { return params.domain; };

  // return the Website object to use
  return Website;

};
