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
const Validate      = require('../utils/validate');
const LANG          = require('../../lang/en.json');
const Channel       = require('../utils/channel');

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * Local parameter
  **/
  var channel = new Channel();

  /**
  * The Report object to return that we can use
  **/
  var Report = new EventEmitter();

  // configure the events
  channel.on('message', _.bind(function(data) {

    // handle the message
    Report.handleMessage(data);

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
    patterns:   []

  }, params);

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
  Report.handleMessage = function(data) {

    if(!data.item) return;
    var item = data.item;

    if(item.status === 'done') {

      console.dir(item);

      // done
      channel.close();
      Report.emit('done');
      console.log('closed channel');

    }

  };

  /**
  * Does the request to create a crawl
  **/
  Report.createCrawl = function(params, fn) {

    /**
    * Build up the params we can use to send
    **/
    var params = {

      url:        this.getURL(),
      recursive:  this.isRecursive(),
      bail:       this.isBail(),
      limit:      this.getLimit(),
      patterns:   this.getPatterns()

    };

    // check the token
    if(this.getToken() != null)
      params.token = this.getToken();

    /**
    * Submit to the actual API
    **/
    api.submitCrawl(

      params,
      function(err, response) {

        // handle the error if any
        if(err) return fn(err);

        // register for events to this report
        channel.subscribe('crawl' + response.id);

      }

    );

  };

  /**
  * Does the request to start a report on the service
  **/
  Report.create = function(fn) {

    /**
    * Build up the params we can use to send
    **/
    var params = {

      url:      this.getURL(),

    };

    // check the token
    if(this.getToken() != null)
      params.token = this.getToken();

    /**
    * Submit to the actual API
    **/
    api.submit(

      params,
      function(err, response) {

        // handle the error if any
        if(err) return fn(err);

        // register for events to this report
        channel.subscribe('report' + response.id);

      }

    );

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
      var cleanedTarget = (target || '').toLowerCase();
      if( S(cleanedTarget).startsWith("http://") === false &&
            S(cleanedTarget).startsWith("https://") === false )
              cleanedTarget = 'http://' + cleanedTarget;

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
    if(this.isRecursive() && this.getToken() === null) {
      fn(new Error(LANG.ERROR_RECURSIVE_TOKEN));
      return this;
    }

    // validate the domain
    this.validateTarget(this.getURL(), _.bind(function(err) {

      // did we get a error ?
      if(err)
        return fn(err);

      // boot our channel
      channel.start();

      // wait till the channel is ready
      channel.once('ready', _.bind(function() {

        // according to type start
        if(this.isRecursive()) {

          Report.createCrawl({

            url:          this.getURL(),
            token:        this.getToken(),
            bail:         this.isBail(),
            recursive:    this.isRecursive(),
            patterns:     this.getPatterns()

          }, function(err, response) {

            // all good, run this report
            fn(null);

          });

        } else {

          // start a single page report
          Report.create({

            url:          this.getURL(),
            token:        this.getToken()

          }, function(err, response) {

            // all good, run this report
            fn(null);

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
