/**
* Pull in required modules
**/
const EventEmitter  = require('events');
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const S             = require('string');
const ngrok         = require('ngrok');
const crypto        = require('crypto');

const config        = require('../config');
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
  var channel               = Channel({

    url:  config.getWebsocketSocketURL()

  });
  var model                 = {

    issues:    []

  };
  var issues                = [];
  var currentReportID       = null;
  var currentCrawlID        = null;
  var isDone                = false;
  var isStarted             = false;

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

    // emit the raw message
    Report.emit('message', data);

    // handle the message
    Report.handleMessage.push(data);

  }, this));

  /**
  * Set our local parameters to use
  **/
  Report.config     = _.extend({

    recursive:  false,
    bail:       false,
    running:    true,
    url:        null,
    token:      null,
    limit:      null,
    filters:    [],
    patterns:   [],
    update:     4,
    cli:        params.cli === true

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

    // stop
    Report.config.running = false;

    // try to close the channel if not closed
    try {

      // call #close() to free up fd
      channel.close();

    } catch(err) {}

    // get the result
    var result = Report.getResult();

    // emit the ending event
    if(err) {

      // emit the error
      Report.emit('error',  err);

    }

    // emit the end
    Report.emit('done', result);
    Report.emit('end',  result);

    // kill our local instance
    ngrok.disconnect(this.getURL().host);

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
  * Parses the domain
  **/
  Report.getFriendlyName = function() {

    // parse the url
    var uri = url.parse(this.getURL() || '');

    // build up the report
    var port = uri.port;

    // must have a hostname
    if(!uri.hostname) return this.getURL();

    // the list of params we are going to build out
    var nameStrs = [];

    // if https add it
    if(uri.protocol === 'https:') {

      // add the protocol
      nameStrs.push(uri.protocol + '//');

      // set the port
      if(!port) port = 443;

    }

    // add the hostname
    nameStrs.push(uri.hostname);

    // set the port
    if(!port) port = 80;

    // add the port if not defaults
    if(port != 80 && port != 443) {

      // add the port
      nameStrs.push(':' + port);

    }

    // add the port if not default
    nameStrs.push(uri.path);

    // return the full name
    return nameStrs.join('');

  };

  /**
  * Update the message we got
  **/
  Report.handleMessage = async.queue(function(data, cb) {

    // done ?
    if(Report.config.running == false) {

      // stop exec here
      return cb(null);

    }

    // get the item details
    var item = (data || {}).item || {};

    // right so first check that this messages matches
    // either a crawl ora  report we are looking after.
    if(currentCrawlID !== null) {

      // handle the website information
      if(data.event == 'website') {

        // update our crawl item
        model = _.extend({}, model, item);

        // emit update
        Report.emit('update', Report.getResult());

        // check if done
        if(item.status == 'available') {

          // check the status
          Report.handleCallback();

        }

      } else if(data.event == 'page') {

        // emit page
        Report.emit('page', item);

      } else if(data.event === 'issue') {

        // loop the test
        if(!model.rules) model.rules = [];

        // check if already defined
        var alreadyDefined = false;
        var definedIndex = 0;

        // loop the current rules
        for(var a = 0; a < (model.rules || []).length; a++) {

          // is defined ?
          if(model.rules[a].uid === item.uid && 
              model.rules[a].test === item.test && 
                model.rules[a].category === item.category){

            // update
            model.rules[a] = _.extend({}, item);

            // set it
            alreadyDefined = true;

            // stop 
            break;

          }

        }

        // is defined ?
        if(alreadyDefined === false) {

          model.rules = (model.rules || []).concat(item);
          Report.emit('issue', item);

        }

      }

    } else if(currentReportID !== null) {

      // check that the reportid matches
      if(currentReportID !== data.uid) return cb(null);

      // then check the action
      if(data.event === 'page' || 
          data.event === 'session') {

        // update the item
        model = _.extend({}, model, item);

        // emit update
        Report.emit('update', Report.getResult());

        // check if we got a done signal :)
        if(item.status === 'done')
          Report.handleCallback();

      } else if(data.event === 'test') {

        // loop the test
        for(var a = 0; a < (model.tests || []).length; a++) {

          // check if the id matches
          if( model.tests[a].id !== data.testid ) continue;

          // update our test objects
          model.tests[a] = _.extend({}, model.tests[a], item);

          // emit update
          Report.emit('test', _.extend({}, model.tests[a]));

          // done processing
          break;

        }

      } else if(data.event === 'issue') {

        // loop the test
        if(!model.rules) model.rules = [];

        // check if already defined
        var alreadyDefined = false;
        var definedIndex = 0;

        // loop the current rules
        for(var a = 0; a < (model.rules || []).length; a++) {

          // is defined ?
          if(model.rules[a].uid === item.uid && 
              model.rules[a].test === item.test && 
                model.rules[a].category === item.category){

            // update
            model.rules[a] = _.extend({}, item);

            // set it
            alreadyDefined = true;

            // stop 
            break;

          }

        }

        // is defined ?
        if(alreadyDefined === false) {

          model.rules = (model.rules || []).concat(item);
          Report.emit('issue', item);

        }

      }

      // emit update
      Report.emit('update', Report.getResult());

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
    * Submit to the actual API
    **/
    api.submitCrawl(

      params,
      function(err, response) {

        // handle the error if any
        if(err) return fn(err);

        // was this a error ?
        if(response.status === 'error') {

          // yes output that instead then
          return fn(new Error(response.message || 'Something went wrong while starting the report'), response)

        }

        // set the id
        currentCrawlID = (response.item.crawling || {}).uid;

        // set the initial item
        model = response.item;

        // register for events to this report
        channel.subscribe('website.' + response.item.secret);

        // add the listener to check when done
        // Report.createStatusChecker();

        // finish with the callback
        return fn(err, response);

      }

    );

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
          return fn(new Error(response.message || 'Something went wrong while starting the report'), response)

        }

        // get the item
        var item = response.item;

        // set the id
        currentReportID = item.uid;

        // set the initial item
        model = response;

        // register for events to this report
        channel.subscribe('reports'  + item.uid);
        channel.subscribe('report.' + item.uid);

        // add the listener to check when done
        Report.createStatusChecker();

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
  Report.getTargetIP = function(target, fn) {

    // first check if a ip ... ?
    Validate.isIP(target, function(err, result) {

      // error ?
      if(err) return fn(err, false);

      // output result
      if(result === true) {

        // return the ip
        return fn(err, target);

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

        // done
        fn(null, address);

      });

    });

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

        // done
        fn(null);

      });

    });

  };

  /**
  * Creates the status checker
  **/
  Report.createStatusChecker = function() {

    // already created ?
    if(Report.checker) clearTimeout(Report.checker);

    // are we not done already ?
    if(model && model.status == 'done') return;

    // is the config not blank ...
    if(Report.config.update === null || 
        Report.config.update === undefined) 
          return;

    // create it
    Report.checker = setTimeout(function() {

      // check the status
      Report.checkStatus(function() {

        // so are we good ?
        if(model.status === 'done') {

          // finish up
          Report.handleCallback();

        } else {

          // create the check again
          Report.createStatusChecker();

        }

      });

    }, 1000 * Report.config.update);

  };

  /**
  * Check status of report
  **/
  Report.checkStatus = function(fn) {

    // 

    /**
    * Submit to the actual API
    **/
    api.get(

      params,
      function(err, response) {

        // handle the error if any
        if(err) return fn(err);

        // was this a error ?
        if(response.status !== 'ok') {

          // yes output that instead then
          return fn(new Error(response.message || 'Something went wrong while check the report status'))

        }

        // get the item
        var item = response.item;

        // did we get the icon
        if(!item) return fn(null);

        // set the id
        currentReportID = item.uid;

        // set the initial item
        model = _extend(model, item);

        // finish with the callback
        fn(null);

      }

    );

  };

  /**
  * Start the report
  **/
  Report.start    = function(fn) {

    // sanity check if we found a callback
    if(!fn)
      throw new Error(LANG.ERROR_CALLBACK_REQUIRED);

    // check if started
    if(isStarted === true) {
      fn(new Error(LANG.ERROR_ALREADY_STARTED));
      return this;
    }

    // local ref
    var self = this;

    // mark as started
    isStarted = true;

    // check if this is a crawl, with no token ...
    if(this.isRecursive() === true && this.getToken() === null) {
      fn(new Error(LANG.ERROR_RECURSIVE_TOKEN));
      return this;
    }

    // get the target ip
    Report.getTargetIP(this.getURL(), (err, address) => {

      // validate the address
      Validate.isLocalIP(address, (err, localResult) => {

        // done with error
        if(err) return fn(err);

        // boot our channel
        channel.connect();

        // clean the url
        var cleanedUrl = Report.prefixProtocol(this.getURL());

        // parse the url
        var uri = url.parse(cleanedUrl);

        // get the port
        var defaultPort = uri.port;

        // did we have a port ?
        if(!defaultPort && uri.proto == 'https:') {

          defaultPort = 443;

        } else if(!defaultPort) {

          defaultPort = 80;

        }

        // start the actual report
        var bootReport = (bootParams, bootCallback) => {

          // create the sha1 engine
          var shasum = crypto.createHash('sha1');

          // add our digest
          shasum.update(cleanedUrl);

          // get the key
          var hash = shasum.digest('hex');

          // start to listen for a domain wide key,
          // as to make sure we don't miss anything.
          channel.subscribe('url.' + hash);

          // build up the params
          var startParams = {

            url:          this.getURL(),
            token:        this.getToken(),
            bail:         this.isBail(),
            recursive:    this.isRecursive(),
            patterns:     this.getPatterns()

          };

          if(bootParams.proxy) startParams.proxy = bootParams.proxy || null;

          // according to type start
          if(this.isRecursive()) {

            // start a multi-page crawl
            Report.createCrawl(startParams, function(err, response) {

              // all good, run this report
              return bootCallback(err, response);

            });

          } else {

            // start a single page report
            Report.create(startParams, function(err, response) {

              // all good, run this report
              return bootCallback(err, response);

            });

          }

        };

        // wait till the channel is ready
        channel.once('ready', _.bind(function() {

          if(localResult === true) {

            ngrok.connect({

              addr:           address + ':' + defaultPort,
              proto:          'http', // http|tcp|tls
              host_header:    uri.hostname

            }, (err, tunnelURL) => {

              // return a error
              if(err) {

                // kill all
                ngrok.disconnect(uri.host);

                // done
                return fn(err);

              }

              // boot the report
              bootReport({

                backend:    cleanedUrl,
                proxy:      tunnelURL

              }, function(err, res) {

                // finish up command
                fn(err, res);

              });

            });

          } else {

            bootReport({

              backend:    cleanedUrl

            }, function(err, res) {

              fn(err, res);

            });

          }

        }, this));

      });

    });

    // return our instance
    return this;

  };

  // return the report object to use
  return Report;

};
