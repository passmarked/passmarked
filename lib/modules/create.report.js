/**
* Pull in required modules
**/
const EventEmitter  = require('events');
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const S             = require('string');

const api           = require('../api');
const Models        = require('../models');
const Validate      = require('../utils/validate');
const LANG          = require('../../lang/en.json');
const Channel       = require('../utils/channel');

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * Local parameters
  **/
  var channel               = Channel();
  var model                 = {};
  var issues                = [];
  var currentReportID       = null;
  var currentCrawlID        = null;
  var isDone                = false;

  /**
  * The Report object to return that we can use
  **/
  var Report = new EventEmitter();

  /**
  * Handle a error from the channel, so a timeout
  * or the connection broke.
  **/
  channel.on('error', function(err){

    // stop the show here and report this error
    Report.handleCallback(err);

  });

  // configure the events
  channel.on('message', _.bind(function(data) {

    // handle the message
    Report.handleMessage.push(data);
    // Report.handleMessage(data);

  }, this));

  /**
  * Set our local parameters to use
  **/
  Report.config     = _.extend({

    recursive:  false,
    bail:       false,
    url:        null,
    token:      null,
    limit:      null,
    filters:    [],
    patterns:   []

  }, params);

  /**
  * Returns the result from the run
  **/
  Report.getResult = function() {

    // depending on type
    if(this.isRecursive() === true)
      return Models.createReport(model);
    else
      return Models.createPage(model);

  };

  /**
  * Does the final call to done,
  * this function ensure the call
  * is only done once and removes
  * all the event listeners just
  * to be safe.
  **/
  Report.handleCallback = _.once(function(err) {

    // try to close the channel if not closed
    try {

      // call #close()
      channel.close()

    } catch(err) {}

    // emit a error we found
    if(err) Report.emit('error', err);

    // emit the ending event
    Report.emit('done', err);
    Report.emit('end', err);

    // stop it
    Report.removeAllListeners();

  }, this);

  /**
  * Returns the list of filters to use
  **/
  Report.getFilters = function() { return (this.config || {}).filters || []; }

  /**
  * Returns the list of patterns we should use
  **/
  Report.getPatterns = function() { return (this.config || {}).patterns || []; }

  /**
  * Returns the limit of pages to check in this crawl
  **/
  Report.getLimit = function() { return (this.config || {}).limit || null; }

  /**
  * Returns the token used for this request
  **/
  Report.getToken = function() { return (this.config || {}).token || null; }

  /**
  * Returns true if this is recursive, IE "crawl"
  **/
  Report.isRecursive = function() { return (this.config || {}).recursive === true; }

  /**
  * Returns true if configured to bail after a error
  **/
  Report.isBail = function() { return (this.config || {}).bail === true; }

  /**
  * Returns the URL that this report was created on
  **/
  Report.getURL = function() { return (this.config || {}).url || null; }

  /**
  * Update the message we got
  **/
  Report.handleMessage = async.queue(function(data, cb) {

    // get the item details
    var item = (data || {}).item || {};

    // right so first check that this messages matches
    // either a crawl ora  report we are looking after.
    if(currentCrawlID !== null) {

      // should match our current crawl
      if(data.crawlid != currentCrawlID && item.crawlid != currentCrawlID) return;

      // define rules if nothing defined yet
      if(!model.rules) model.rules = [];

      // check th eitem
      if(data.action == 'stats') {

        // update our crawl item
        model = _.extend({}, model, item);

        // check the status
        if(item.status === 40)
          Report.handleCallback();

        // emit out update event
        Report.emit('update');

      } else if(data.action == 'issue') {

        // flag to track if we found it
        var foundFlag = false;

        // loop all the current rules and update ours
        for(var a = 0; a < model.rules.length; a++) {

          // handle it
          if( model.rules[a].uid != item.uid ) continue

          // update it
          model.rules[a] = _.extend({}, model.rules[a], item);

          // found it
          foundFlag = true;

          // stop right there to save a few ms
          break;

        }

        // report the issue we found
        Report.emit('issue', item);

        // add it
        if(foundFlag == false)
          model.rules.push(item);

      } else if(data.action == 'report') {

        // emit page
        Report.emit('page', item);

      }

    } else if(currentReportID !== null) {

      // check that the reportid matches
      if(currentReportID !== data.reportid) return;

      // then check the action
      if(data.action === 'report') {

        // update the item
        model = _.extend({}, model, item);

        // check if we got a done signal :)
        if(item.status === 'done')
          Report.handleCallback();

        // emit update
        Report.emit('update');

      } else if(data.action === 'test') {

        // loop the test
        for(var a = 0; a < (model.tests || []).length; a++) {

          // check if the id matches
          if( model.tests[a].id !== data.testid ) continue;

          // update our test objects
          model.tests[a] = _.extend({}, model.tests[a], item);

          // done processing
          break;

        }

        // emit update
        Report.emit('test');

      }

    }

    // done
    cb(null);

  }, 1);

  /**
  * Does the request to create a crawl
  **/
  Report.createCrawl = function(params, fn) {

    // parse the url
    var uri = url.parse(params.url);

    /**
    * Get the list of websites we can use
    **/
    api.websites(params.token, function(err, response) {

      // handle the error if any
      if(err) return fn(err);

      // was this a error ?
      if(response.status === 'error') {

        // yes output that instead then
        return fn(new Error('Could not get list of websites for the token'))

      }

      // look for a website that matches the given domain
      var website = _.find((response || {}).items || [], function(website) { return website.domain === uri.hostname; });

      // must have the website
      if(!website) return fn(new Error('No website with the domain - ' + uri.hostname + ' was found'));

      /**
      * Submit to the actual API
      **/
      api.submitCrawl(

        _.extend({}, params, {

          websiteid: website.id

        }),
        function(err, response) {

          // handle the error if any
          if(err) return fn(err);

          // was this a error ?
          if(response.status === 'error') {

            // yes output that instead then
            return fn(new Error(response.message || 'Something went wrong while starting the report'))

          }

          // set the id
          currentCrawlID = response.item.id;

          // set the initial item
          model = response.item;

          // register for events to this report
          channel.subscribe('crawl' + response.item.id);

          // finish with the callback
          return fn(err, response);

        }

      );

    });

  };

  /**
  * Does the request to start a report on the service
  **/
  Report.create = function(params, fn) {

    /**
    * Submit to the actual API
    **/
    api.submit(

      params,
      function(err, response) {

        // handle the error if any
        if(err) return fn(err);

        // was this a error ?
        if(response.status === 'error') {

          // yes output that instead then
          return fn(new Error(response.message || 'Something went wrong while starting the report'))

        }

        // set the id
        currentReportID = response.id;

        // set the initial item
        model = response;

        // register for events to this report
        channel.subscribe('report' + response.id);

        // finish with the callback
        fn(null);

      }

    );

  };

  /**
  * Appends the protocol if missing
  **/
  Report.prefixProtocol = function(url) {

    // lowercase the url
    var cleanedUrl = ('' + url).toLowerCase();
    if( S(cleanedUrl).startsWith("http://") === false &&
      S(cleanedUrl).startsWith("https://") === false )
        return 'http://' + url;

    // already has the protcol, just return it
    return url;

  };

  /**
  * Validates the passed domain, must be a valid domain
  **/
  Report.validateTarget = function(target, fn) {

    // first check if a ip ... ?
    Validate.isIP(target, function(err, result) {

      // error ?
      if(err) return fn(err, false);

      // output result
      if(result === true) {

        // check if not local
        return Validate.isLocalIP(target, function(err, result) {

          // done with error
          if(err) return fn(err);

          // check if we got a result
          if(result === true)
            return fn(new Error(LANG.ERROR_IP_LOCALHOST));

          // all good
          fn(null);

        });

      }

      // add the target
      var cleanedTarget   = (target || '').toLowerCase();
      cleanedTarget       = Report.prefixProtocol(cleanedTarget);

      // parse the url
      var parsedUrl = url.parse(cleanedTarget);

      // must be defined
      if(!parsedUrl) return fn(new Error(LANG.ERROR_INVALID_DOMAIN));

      // get domain path
      Validate.isDomain(parsedUrl.hostname, function(err, result, address) {

        // check if we got a error
        if(err) return fn(err);

        // check if we found it
        if(result === false) return fn(new Error(LANG.ERROR_IP_LOCALHOST));

        // validate the address
        Validate.isLocalIP(address, function(err, result) {

          // done with error
          if(err) return fn(err);

          // check if we got a result
          if(result === true)
            return fn(new Error(LANG.ERROR_IP_LOCALHOST));

          // all good
          fn(null);

        });

      });

    });

  };

  /**
  * Start the report
  **/
  Report.start    = function(fn) {

    // sanity check if we found a callback
    if(!fn)
      throw new Error(LANG.ERROR_CALLBACK_REQUIRED);

    // check if this is a crawl, with no token ...
    if(this.isRecursive() === true && this.getToken() === null) {
      fn(new Error(LANG.ERROR_RECURSIVE_TOKEN));
      return this;
    }

    // validate the domain
    this.validateTarget(this.getURL(), _.bind(function(err) {

      // did we get a error ?
      if(err) return fn(err);

      // boot our channel
      channel.connect();

      // wait till the channel is ready
      channel.once('ready', _.bind(function() {

        // clean the url
        var cleanedUrl = Report.prefixProtocol(this.getURL());

        // parse the url
        var uri = url.parse(cleanedUrl);

        // start to listen for a domain wide key,
        // as to make sure we don't miss anything.
        channel.subscribe('domain.' + uri.domain);

        // according to type start
        if(this.isRecursive()) {

          // start a multi-page crawl
          Report.createCrawl({

            url:          this.getURL(),
            token:        this.getToken(),
            bail:         this.isBail(),
            recursive:    this.isRecursive(),
            patterns:     this.getPatterns()

          }, function(err, response) {

            // all good, run this report
            return fn(err, response);

          });

        } else {

          // start a single page report
          Report.create({

            url:          this.getURL(),
            token:        this.getToken()

          }, function(err, response) {

            // all good, run this report
            return fn(err, response);

          });

        }

      }, this));

    }, this));

    // return our instance
    return this;

  };

  // return the report object to use
  return Report;

};
