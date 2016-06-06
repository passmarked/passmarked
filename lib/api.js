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
const request       = require('request');
const _             = require('lodash');
const querystring   = require('querystring');

/**
*
**/
API = {};

/**
* Start the request
**/
API.request = function(params, fn) {

  // build up the options
  var options = _.extend({}, params, {

    timeout: 10 * 1000,
    jar: false,
    headers: {

      'User-Agent': Constants.USER_AGENT

    }

  });

  // debugging
  Log.debug('Doing a request to ' + params.url + ' with headers: ' + JSON.stringify(options, null, 2))

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
    if(parsedBody && parsedBody.status) {

      // done
      fn(null, parsedBody);

    } else fn(new Error('Something went wrong'));

  });

};

/**
* Get the list of websites that a token has access to
**/
API.websites = function(token, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v1/websites?' + querystring.stringify({

        token: token

      }),
      method: 'GET'

    }, fn);

};

/**
* Returns the current balance of a token
**/
API.get = function(key, fn) {

  // get the params from the key
  var year = key.slice(0, 4);
  var month = key.slice(4, 6);

  // read in the reporting config
  config.build(function(err){

    // output a error
    if(err) {

      // output the error
      Log.error('Issues building the config from user config', err);

      // done
      return fn(err);

    }

    // do the request
    API.request({

        url: Constants.DATA_URL + '/' + year + '/' + month + '/' + key + '.json',
        method: 'GET'

      }, fn);

  });

};

/**
* Returns the current balance of a token
**/
API.balance = function(fn) {

  // read in the reporting config
  config.build(function(err){

    // output a error
    if(err) {

      // output the error
      Log.error('Issues building the config from user config', err);

      // done
      return fn(err);

    }

    // do the request
    API.request({

        url: Constants.API_URL + '/v1/balance?' + querystring.stringify({

          token: config.getToken()

        }),
        method: 'GET'

      }, fn);

  });

};

/**
* Get the current profile of the token
**/
API.me = function(token, fn) {

  // read in the reporting config
  config.build(function(err){

    // output a error
    if(err) {

      // output the error
      Log.error('Issues building the config from user config', err);

      // done
      return fn(err);

    }

    // do the request
    API.request({

        url: Constants.API_URL + '/v1/me?' + querystring.stringify({

          token: token || config.getToken()

        }),
        method: 'GET'

      }, fn);

  });

};

/**
* Start a crawl as specified
**/
API.submitCrawl = function(params, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v1/websites/' + params.websiteid + '/crawls',
      method: 'POST',
      form: {

        token: params.token

      }

    }, fn);

};

/**
* Read in our config file if present
**/
API.submit = function(params, fn) {

  // do the request
  API.request({

      url: Constants.API_URL + '/v1/submit',
      method: 'POST',
      form: {

        url:      params.url,
        token:    params.token

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
