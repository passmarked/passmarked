/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/

/**
* Get our modules
**/
const pkg           = require('../package.json');
const Constants     = require('./constants')
const config        = require('./config');
const Log           = require('./utils/log');
const url           = require('url');
const os            = require('os');
const request       = require('request');
const _             = require('lodash');
const querystring   = require('querystring');

/**
*
**/
API = {};

/**
* Build the tracking info
**/
API.buildTrackingInfo = function(fn) {

  fn(null, {

    device:   'terminal',
    arch:     os.arch(),
    platform: os.platform(),
    release:  os.release(),
    source:   Constants.SOURCE,
    app:      Constants.APPNAME,
    version:  Constants.VERSION

  })

};  

/**
* Start the request
**/
API.request = function(params, fn) {

  // build the tracker
  API.buildTrackingInfo(function(err, info) {

    // parse the url
    var uri = url.parse(params.url || '');

    // check if string
    if(typeof uri.query === 'string') {

      // parse it
      uri.query = querystring.parse(uri.query);

    }

    // parse the query
    var query = _.extend({}, info, uri.query);

    // stringify it
    uri.query = query;

    // use the param
    var target  = url.format(uri);

    // build up the options
    var options = _.extend({}, params, {

      url:      target,
      timeout:  params.timeout || 10 * 1000,
      jar:      false,
      headers:  {

        'User-Agent': Constants.USER_AGENT

      }

    });

    // debug
    Log.debug('Doing ' + params.method + ' to ' + params.url)

    // according to type
    if(options.form) {

      // add to the params
      options.form = _.extend({}, info, options.form);

    }

    // debugging
    Log.debug('Doing a request to ' + target + ' with headers: ' + JSON.stringify(options, null, 2))

    // do the actual request
    request(options, function(err, response, body) {

      // check for a error
      if(err) {

        // stop with the error
        return fn(err);

      }

      // try to parse the body
      var parsedBody = null;

      // debugging
      Log.debug('Received status code ' + (response || {}).statusCode + ' from the API');
      Log.debug('with the body of:\n' + body);

      // try it
      try {

        // do the actual parse
        parsedBody = JSON.parse(body);

      } catch(err) {}

      // check if we got a 200 ... ?
      if(parsedBody) {

        // done
        fn(null, parsedBody);

      } else {

        // done
        fn(new Error('Something went wrong'));

      }

    });

  });

};

/**
* Sends information about the DNS resolution to help
* the DNS protection from Passmarked spot malicous DNS hijacking
**/
API.resolve = function(params, fn) {

  // do the request
  API.request({

    url:      Constants.API_URL + '/v2/resolve',
    method:   'POST',
    form:     params

  }, function() {

    /**
    * This is happening in the background, we don't care if it completes
    **/

  });

  // just continue
  fn(null);

};

/**
* Tracks the result for analytical data
**/
API.result = function(params, fn) {

  // do the request
  API.request({

    url:      Constants.API_URL + '/v2/result',
    method:   'POST',
    form:     params

  }, fn);

};

/**
* Sends tracking information to the event log
**/
API.track = function(params, fn) {

  // do the request
  API.request({

    url:      Constants.API_URL + '/v2/events',
    method:   'POST',
    form:     params

  }, function() {

    /**
    * This is happening in the background, we don't care if it completes
    **/

  });

  // just continue
  fn(null);

};

/**
* Get the list of websites that a token has access to
**/
API.websites = function(params, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v2/websites?' + querystring.stringify({

        token: params.token

      }),
      method: 'GET'

    }, fn);

};

/**
* Get the list of websites that a token has access to
**/
API.website = function(params, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v2/websites/' + params.id + '?' + querystring.stringify({

        token: params.token

      }),
      method: 'GET'

    }, fn);

};

/**
* Returns the issues of a report
**/
API.getIssues = function(params, fn) {

  // do the request
  API.request({

      url:    Constants.API_URL + '/v2/reports/' + params.key + '/issues',
      method: 'GET'

    }, fn);

};

/**
* Returns the current balance of a token
**/
API.get = function(params, fn) {

  // do the request
  API.request({

      url:    Constants.API_URL + '/v2/reports/' + params.key,
      method: 'GET'

    }, fn);

};

/**
* Returns the current balance of a token
**/
API.balance = function(params, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v2/balance?' + querystring.stringify({

        token: params.token

      }),
      method: 'GET'

    }, fn);

};

/**
* Get the current profile of the token
**/
API.user = function(params, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v2/user?' + querystring.stringify({

        token: params.token

      }),
      method: 'GET'

    }, fn);

};

/**
* Submits a email for a user to subscribe the community channels
**/
API.subscribe = function(params, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v2/subscribe',
      method: 'POST',
      form: {

        email:      params.email

      }

    }, fn);

};

/**
* Start a crawl as specified
**/
API.submitCrawl = function(params, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v2/reports',
      method: 'POST',
      form: {

        token:      params.token,
        url:        params.url,
        recursive:  true,
        bail:       params.bail === true,
        limit:      params.limit || null

      }

    }, fn);

};

/**
* Read in our config file if present
**/
API.submit = function(params, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v2/reports',
      method: 'POST',
      form: {

        url:          params.url,
        token:        params.token,
        command:      params.command

      }

    }, fn);

};

/**
* Returns the current version
**/
API.getVersion = function() { return pkg.version; };

/**
* Expose the API
**/
module.exports = exports = API;
