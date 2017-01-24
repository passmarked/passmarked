/**
* Pull in required modules
**/
const Constants       = require('../constants');
const async           = require('async');
const request         = require('request');
const url             = require('url');
const dns             = require('dns');
const _               = require('lodash');
const S               = require('string');
const querystring     = require('querystring');
const SnippetManager  = require('../utils/snippet');
const uuid            = require('uuid');
const crypto          = require('crypto');

/**
* Parses out our functions to use
**/
var parseVariablesFromParams = function(params, har, content) {

  // the vars
  var opts = {};

  // set the params if given 
  if(har)     params.har      = har;
  if(content) params.content  = content;

  // add the content
  opts.content = params.body || params.content || null;

  // set the data from the payload with defaults
  opts.data           = JSON.parse(JSON.stringify(params));
  opts.data.stack     = params.stack || [];
  opts.data.content   = null;
  opts.data.har       = null;
  opts.data.uri       = url.parse(params.url);
  opts.cache          = (params || {}).cache || {};

  // parse the HAR
  opts.har            = null;

  // check the type
  if(Object.prototype.toString.call(params.har || '').toLowerCase() 
      === '[object string]') {

    // try to parse the JSON
    try {

      opts.har = JSON.parse(params.har);

    } catch(err) { /** don't care **/ }

  } else {

    // define as HAR
    opts.har = params.har;

  }

  // returns the final opts
  return opts;

};

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params, har, content) {

  /**
  * The Report object to return that we can use
  **/
  var Payload = _.extend({}, require('./common')(params));

  /**
  * Build our list of local functions
  **/
  var options = parseVariablesFromParams(params, har, content);

  /**
  * Keeps track of the existing URLS
  **/
  var rules = {};

  /**
  * The list of rules
  **/
  var logs = [];

  /**
  * Counts we keep track of
  **/
  var ruleCount = 0;

  /**
  * Cached variable of the current response
  **/
  var currentHarEntry = null;

  /**
  * Internal cache that is used, on the server side
  * the idea is that the cache methods are overrided 
  * to fetch from a real cache like Redis
  **/
  var cache = _.extend({}, options.cache || {});

  /**
  * Sets a item in the cache
  **/
  Payload.set = function(key, value, fn) {

    // if the key is a object set those values
    if(typeof key === 'object') {

      // get the keys from the object
      var keys = _.keys(key);

      // loop and set all the keys
      async.each(keys, function(cacheKey, cb) {

        // set in cache
        var loweredKey = (cacheKey || '').toLowerCase();

        // set in the "cache"
        cache[loweredKey] = key[ cacheKey ];

        // done
        cb(null);

      }, function(err) {

        // check if any of the left over
        // params are a function to call
        if(typeof value === 'function') {

          // call callback
          value(null);

        } else if(typeof fn === 'function') {

          // call callback
          fn(null);

        } else {

          /**
          * Well fudge, nothing to call back, guess
          * the caller needs to read up about async ...
          **/

        }

      });

    } else if(key) {

      // set in cache
      var loweredKey = (key || '').toLowerCase();

      // set the key
      cache[loweredKey] = value;

      // finish
      fn(null);

    } else {

      // did not understand the request
      fn(null);

    }

    // return this
    return this;

  };

  /**
  * Deletes the del
  **/
  Payload.del = function(key, fn) {

    // lower case the key
    var lowerKey = (key || '').toLowerCase();

    // delete the key
    cache[lowerKey] = null;

    // just return
    fn(null);

  };

  /**
  * Returns a item from cache, if the key is defined
  * the value is returned or null if it does not exist.
  **/
  Payload.get = function(key, fn) {

    // is the key defined ?
    if(key)  {

      // lower case the key
      var lowerKey = (key || '').toLowerCase();

      // check if the item is in the cache
      // if not return null
      fn(null, cache[lowerKey] || null);

    } else fn(null, null); // noping out of here :\

  };

  /**
  * Converts the headers to a map
  **/
  Payload.getMappedHeaders = function(headers, fn) {

    // the object headers
    var mappedHeaders = {};

    // loop the headers
    for(var i = 0; i < (headers || []).length; i++) {

      // add to the list
      var name        = S(headers[i].name || '').trim().s.toLowerCase();
      var value       = S(headers[i].value || '').trim().s;

      // should not be empty
      if(S(name).isEmpty() === true) continue;

      // set the headers
      mappedHeaders[name] = value;

    }

    // return the headers
    return mappedHeaders;

  };

  /**
  * Checks for the page response and returns the selected item we are looking for
  **/
  Payload.getResponse = function(fn) {

    // returns the request
    this.getHAREntry(function(err, entry) {

      // check for a error
      if(err) return fn(err);

      // sanity check that we have a har entry
      if(!entry) return fn(null);

      // else sent out our entry object
      if(!entry.response) return fn(null);

      // return the entry
      fn(null, entry.response);

    });

  };

  /**
  * Checks for the page response and returns the selected item we are looking for
  **/
  Payload.getRequest = function(fn) {

    // returns the request
    this.getHAREntry(function(err, entry) {

      // check for a error
      if(err) return fn(err);

      // sanity check that we have a har entry
      if(!entry) return fn(new Error('HAR could not be found'));

      // else sent out our entry object
      if(!entry.request) return fn(null);

      // return the entry
      fn(null, entry.request);

    });

  };

  /**
  * Returns the request that was sent to the server
  **/
  Payload.getHAREntry = function(fn) {

    // check if this is not cached already
    if(currentHarEntry) return fn(null, currentHarEntry);

    // get the HAR
    this.getHAR(function(err, har) {

      // if we got a error, stop there
      if(err) return fn(err);

      // check if we got the har ?
      if(!har) return fn(new Error('HAR was not found for the payload'));

      // sanity checks
      if(!har.log) return fn(new Error('Missing a .log for the HAR'));
      if(!har.log.entries) return fn(new Error('Missing a .log for the HAR'));

      // loop the entries
      for(var i = 0; i < har.log.entries.length; i++) {

        // local reference
        var entry = har.log.entries[i];

        // sanity check
        if(!entry) continue;

        // must have a request and response
        if(!entry.response) continue;
        if(!entry.request) continue;

        // get the headers
        var headers = Payload.getMappedHeaders(entry.response.headers);

        // must be 200 
        if(entry.response.status != 200) continue;

        // must have content-type 
        if(!headers['content-type']) continue;

        // must be text/html
        if( (headers['content-type'] || '').indexOf('text/html') === -1 )
          continue;

        // set the current entry
        currentHarEntry = entry;

        // stop the loop
        break;

      }

      // check if we got a entry ?
      if(currentHarEntry) return fn(null, currentHarEntry);
      
      // finish strong
      return fn(null);

    });

  };

  /**
  * Returns the snippet tool we can use
  **/
  Payload.getSnippetManager = function() { return SnippetManager; }

  /**
  * Returns the request that was sent to the server
  **/
  Payload.getDocument = Payload.getHAREntry;

  /**
  * Returns the count of rules, this includes rules
  * that may have been skipped to save on size.
  **/
  Payload.getRuleCount = function(fn) {

    // check the callback
    if(fn) {

      // done
      return fn(null, ruleCount);

    }

    // return as a normal return
    return ruleCount;

  };

  /**
  * Returns the count of rules, this includes rules
  * that may have been skipped to save on size.
  **/
  Payload.getCount = Payload.getRuleCount;

  /**
  * Returns the logs that have been built
  **/
  Payload.getLogs = function() { return logs; };

  /**
  * Handles debugging messages
  **/
  Payload.debug = function(tag, message) {

    // add to the logs
    logs.push({

      type:       'debug',
      tag:        tag,
      message:    message,
      timestamp:  new Date().getTime()

    });

  };

  /**
  * Handles information messages
  **/
  Payload.info = function(tag, message) {

    // add to the logs
    logs.push({

      type:       'info',
      tag:        tag,
      message:    message,
      timestamp:  new Date().getTime()

    });

  };

  /**
  * Returns the fetched item
  **/
  Payload.fetch = function(params, fn) {

    // create the key to use for the cache
    var cacheKey = [

      'passmarked',
      'workers',
      'session',
      params.key,
      params.label

    ].join(':');

    // has it
    Payload.get(cacheKey, function(err, cachedResult) {

      // return the result
      if(err) {

        // nope
        return fn(err);

      } else if(!cachedResult) {

        // nothing
        return fn(null);

      } else {

        // the result
        var result = null;

        // try to parse
        try {

          // try to parse
          result = JSON.parse(cachedResult)

        } catch(err) {

          // nope
          return fn(null);

        }

        // done
        fn(null, result);

      }

    });

  };

  /**
  * Stores something in the cache for the session
  **/
  Payload.store = function(params, fn) {

    // create the key to use for the cache
    var cacheKey = [

      'passmarked',
      'workers',
      'session',
      params.key,
      params.label

    ].join(':');

    // set in the cache
    Payload.set(cacheKey, JSON.stringify(params.body), function() {

      // done
      fn(null);

    });

  };

  /**
  * check if already triggered for a session
  **/
  Payload.mention = function(params, fn) {

    // get the data
    var data = Payload.getData();

    // get the uid
    var uid         = data.uid || '';
    var session     = data.session || '';
    var rule        = params.key || '';

    // check if this is recusive
    if(S(session.toLowerCase()).endsWith('r') != true) {

      // done
      return setImmediate(fn, null);

    }

    // if it's empty, ignore
    if(S(rule).isEmpty() === true) {

      // done
      return setImmediate(fn, null);

    }

    // should not match
    if(uid == session) return setImmediate(fn, null);

    // create the key to use
    var mentionKey = [

      'passmarked',
      'reports',
      session,
      'mentions',
      rule

    ];

    // check if subject was given
    if(params.subject) {

      // if array, join
      if(Array.isArray(params.subject) === true) {

        // join them
        mentionKey = mentionKey.concat(params.subject || []);

      } else {

        // add to the list
        mentionKey.push(params.subject);

      }

    }

    // convert to string
    mentionKey = mentionKey.join(':');

    // has it
    Payload.set(mentionKey, '1', function(err) {

      // return the result
      setImmediate(fn, err);

    });

  };

  /**
  * check if already triggered for a session
  **/
  Payload.isMentioned = function(params, fn) {

    // get the data
    var data = Payload.getData();

    // get the uid
    var uid         = data.uid || '';
    var session     = data.session || '';
    var rule        = params.key || '';

    // check if this is recusive
    if(S(session.toLowerCase()).endsWith('r') != true) {

      // done
      return setImmediate(fn, null, false);

    }

    // if it's empty, ignore
    if(S(rule).isEmpty() === true) {

      // done
      return setImmediate(fn, null, false);

    }

    // should not match
    if(uid == session) return setImmediate(fn, null);

    // create the key to use
    var mentionKey = [

      'passmarked',
      'reports',
      session,
      'mentions',
      rule

    ];

    // check if subject was given
    if(params.subject) {

      // if array, join
      if(Array.isArray(params.subject) === true) {

        // join them
        mentionKey = mentionKey.concat(params.subject || []);

      } else {

        // add to the list
        mentionKey.push(params.subject);

      }

    }

    // done
    mentionKey = mentionKey.join(':');

    // has it
    Payload.get(mentionKey, function(err, value) {

      // return the result
      setImmediate(fn, err, value === '1');

    });

  };

  /**
  * Does a request we can use
  **/
  Payload.doRequest = function(params, fn) {

    // get the data
    var data = Payload.getData();

    // debugging
    Payload.debug('doRequest', (params.type || 'GET') + ' requested to ' + params.url)

    // build the options
    var options = _.extend({}, params.options || {}, {

      url:              params.url,
      type:             params.type || 'GET',
      method:           params.type || 'GET',

      timeout:          1000 * (params.timeout || 10),
      followRedirect:   true,
      agentOptions:     {

        rejectUnauthorized: false

      }

    });

    // check the cache
    if(data.session && 
        S((data.session || '').toLowerCase()).endsWith('r') === true) {

      // debugging
      Payload.debug('doRequest', 'Checking cache first as this is a session based request for ' + data.session)

      // set the content
      var shasum = crypto.createHash('sha1');
      shasum.update((params.url || '').toLowerCase());
      var hashedUrl = shasum.digest('hex');

      // kill hash
      var killedHash = params.kill === true ? 'killed' : 'normal';

      // check the cache
      var cacheKey = [

        'passmarked',
        'reports',
        data.session,
        'requests',
        killedHash,
        (params.type || 'get').toLowerCase(),
        hashedUrl

      ].join(':');

      // check the cache
      Payload.get(cacheKey, function(err, cachedResult) {

        // try to parse it
        var ParsedCachedResult = null;

        // try to parse
        try {

          // did we find it ?
          if(cachedResult) {

            // set it
            ParsedCachedResult = JSON.parse(cachedResult);

          }

        } catch(err) {

          // nope ...
          ParsedCachedResult = null;

        }

        // check for a cached copy
        if(ParsedCachedResult) {

          // check the error
          if(ParsedCachedResult.error) {

            // debugging
            Payload.debug('doRequest', 'Got cached result, resulted in a error')

            // return it
            return setImmediate(fn, ParsedCachedResult.error);

          }

          // debugging
          Payload.debug('doRequest', 'Got cached result, returned the params')

          // get the response
          return setImmediate(fn, null, ParsedCachedResult.response || {}, (ParsedCachedResult.response || {}).body || '');

        }

        // if this is a kill request, we do a raw stream that we can end
        if(params.kill === true) {

          // create the stream
          var req = request(options);

          // the callback to use
          var callback = _.once(function(err, response) {

            // try to close the stream
            try {

              // close the stream
              req.destroy();

            } catch(err) { /** Not too worried about what we get there ... **/ }

            // finish
            fn(err, response || null);

          });

          // handle any errors
          req.on('aborted', function(err) {

            // load the error
            callback(err);

          });

          // handle any errors
          req.on('error', function(err) {

            // load the error
            callback(err);

          });

          // handle the response
          req.on('response', function(response) {

            // handle the callback=
            callback(null, response || null);

          });

          // do the request
          req.end();

        } else {

          // the item
          request(options, function(err, response) {

            // debugging
            Payload.debug('doRequest', 'Actual request was made to: ' + params.url)

            // done
            Payload.debug('doRequest', 'Setting in cache')

            // set it
            Payload.set(cacheKey, JSON.stringify({

              error:        err || null,
              response:     response

            }), function() {

              // done
              Payload.debug('doRequest', 'Set in cache was done')

              // done
              setImmediate(fn, null, response, response.body || '');

            })

          });

        }

      });

    } else {

      // debugging
      Payload.debug('doRequest', 'Skipping cache for ' + data.session)

      // done
      return request(options, fn);

    }

  };

  /**
  * caches the result of a file with it's hash
  **/
  Payload.setCachedResults = function(params, fn) {

    // the key must be recursive if given
    if(params.session && 
        S((params.session || '').toLowerCase()).endsWith('r') === false) {

      // stop here
      return setImmediate(fn, null);

    }

    // the hash to set
    var hash = (params.key || '') + (params.subject ? ':' + params.subject : '');

    // create the hash if content was given
    if(params.content) {

      // set the content
      var shasum = crypto.createHash('sha1');
      shasum.update(params.content || params.session);
      hash = shasum.digest('hex');

    }

    // create the key to use for the cache
    var cacheKey = [

      'passmarked',
      'workers',
      params.session || 'general',
      hash

    ].join(':').toLowerCase();

    // has it
    Payload.set(cacheKey, JSON.stringify(params.body), function(err) {

      // return the result
      setImmediate(fn, err);

    });

  };

  /**
  * caches the result of a file with it's hash
  **/
  Payload.getCachedResults = function(params, fn) {

    // the key must be recursive if given
    if(params.session && 
        S((params.session || '').toLowerCase()).endsWith('r') === false) {

      // stop here
      return setImmediate(fn, null);

    }

    // the hash to set
    var hash = (params.key || '') + (params.subject ? ':' + params.subject : '');

    // create the hash if content was given
    if(params.content) {

      // set the content
      var shasum = crypto.createHash('sha1');
      shasum.update(params.content || params.session);
      hash = shasum.digest('hex');

    }

    // create the key to use for the cache
    var cacheKey = [

      'passmarked',
      'workers',
      params.session || 'general',
      hash

    ].join(':').toLowerCase();

    // has it
    Payload.get(cacheKey, function(err, cachedResult) {

      // return the result
      if(err) {

        // nope
        return fn(err);

      } else if(!cachedResult) {

        // nothing
        return fn(null);

      } else {

        // the result
        var result = null;

        // try to parse
        try {

          // try to parse
          result = JSON.parse(cachedResult)

        } catch(err) {

          // nope
          return fn(null);

        }

        // done
        fn(null, result);

      }

    });

  };

  /**
  * Handles and warnings that might be present
  **/
  Payload.warning = function(tag, message) {

    // add to the logs
    logs.push({

      type:       'warning',
      tag:        tag,
      message:    message,
      timestamp:  new Date().getTime()

    });

  };

  /**
  * Handles logging error outputs
  **/
  Payload.error = function(tag, message, err) {

    // add to the logs
    logs.push({

      type:       'error',
      tag:        tag,
      message:    message,
      error:      err,
      timestamp:  new Date().getTime()

    });

  };

  /**
  * Should this rule be given another chance to run ?
  **/
  var markedAsRetry = false;

  /**
  * 
  **/
  Payload.markRetry = function() {};

  /**
  * Returns the stack keys that were present
  **/
  Payload.getStack = function(fn) {

    // return the current instance
    return (options.data || {}).stack || '';

  };

  /**
  * Returns the target URL of the data
  **/
  Payload.getURI = function(fn) {

    // return the current instance
    return (options.data || {}).uri;

  };

  /**
  * Returns the target URL of the data
  **/
  Payload.getURL = function(fn) {

    // return the current instance
    return (options.data || {}).url;

  };

  /**
  * Returns the given payload
  **/
  Payload.getData = function(fn) {

    // return the current instance
    return options.data;

  };

  /**
  * Returns the HAR from the payload
  **/
  Payload.getHAR = function(fn) {

    // get the data
    var data = Payload.getData();

    // create the cache key
    var queueName = [ 

      'passmarked',
      'reports',
      data.uid,
      'har'

    ];

    // return the har if defined locally
    if(options.har) {

      // check the har we have
      var currentHar = options.har || {};

      // add missing components if not there
      if(!currentHar.log) currentHar.log = {};
      if(!currentHar.log.entries) currentHar.log.entires = [];

      // finish
      fn(null, currentHar);

      // done
      return this;

    }

    // check if the content is defined in the cache
    Payload.get(queueName.join(':'), function(err, cachedValue) {

      // check if we got a error from the cache
      if(err) return fn(err);

      try {

        // check if we got a value
        if(cachedValue) options.har = JSON.parse(cachedValue);

      } catch(err) {}

      // check the har we have
      var currentHar = options.har || {};

      // add missing components if not there
      if(!currentHar.log) currentHar.log = {};
      if(!currentHar.log.entries) currentHar.log.entires = [];

      // finish
      fn(null, currentHar);

    });

    // return the current instance
    return this;

  };

  /**
  * Returns the page content as given
  **/
  Payload.getPageContent = function(fn) {

    // get the data
    var data = Payload.getData();

    // create the cache key
    var queueName = [ 

      'passmarked',
      'reports',
      data.uid,
      'content'

    ];

    // check if the page content is defined
    if(options.content) {

      // call the callback
      fn(null, options.content || '');

      // return
      return this;

    }

    // check if the content is defined in the cache
    Payload.get(queueName.join(':'), function(err, cachedValue) {

      // check for the value
      if(err) return fn(err);

      // check if the cached value was returned ?
      if(cachedValue) options.content = cachedValue;

      // returns the callback
      fn(err, options.content || '');

    });

    // returns the current instance
    return this;

  };

  /**
  * Returns the rule that took the most time
  **/
  Payload.getHeaviestRule = function() {

    // get the rules
    var rules   = Payload.getRules();

    // get the time
    var timing  = 0;
    var index   = 0;

    /// loop them 
    for(var i = 0; i < (rules || []).length; i++) {

      // check the timestamp
      if(rules[i].lastupdated > timing) {

        // set it
        timing = rules[i].lastupdated;

        // also set the index
        index = 1 * i;

      }

    }

    // done
    return rules[index] || null;

  };

  /**
  * Adds a rule to the payload
  **/
  Payload.addRule = function(params, occurrence, fn) {

    // check if the defaults were given ...
    if(params && 
          params.type && 
            params.key && 
              params.message) {

      // increment the rule count
      ruleCount++;

      // create the rule details
      var rule = _.extend({}, params || {});

      // define the type
      var type = null;

      // check the type
      if(params.type == 'ok') {
        type = 'notice'
      } else if(params.type == 'notice') {
        type = 'notice'
      } else if(params.type == 'warning') {
        type = 'warning'
      } else if(params.type == 'error') {
        type = 'error'
      } else if(params.type == 'critical') {
        type = 'critical'
      }

      // only if the type was defined
      if(type) {

        // should we create the rule ?
        if(!rules[ params.key ]) {

          // create the rule object
          rules[ params.key ] = rule;

          // set created
          // rules[ params.key ].created = new Date().getTime();

        }

        // set the add date
        rules[ params.key ].lastupdated = new Date().getTime();

        // update the count
        var currentCount = 1 * (rules[ params.key ].count || 0);
        rules[ params.key ].count = currentCount + 1;

        // check the occurrence
        if(occurrence) {

          // details to add
          var occurenceTest = _.extend(
            {},
            occurrence,
            {
              uid: uuid.v1().split('-')[0] + '' + currentCount
            }
          );

          // array should be defined
          if(!rules[ params.key ].occurrences)
            rules[ params.key ].occurrences = [];

          // must be smaller than a 100
          if((params.length && params.length === -1) || 
              rules[ params.key ].occurrences.length < (params.length || 50)) {

            // push to array
            rules[ params.key ].occurrences.push( occurenceTest ); 

          }

        }

      }

    }

    // handle a callback if any
    if(fn) fn(null);

    // return the current instance
    return this;

  };

  /**
  * Check if the rule is present on this check
  **/
  Payload.hasRule = function(key) {

    // return from the internal rule map
    if(rules[ key ])
      return true;
    else
      return false;

  };

  /**
  * Returns the parsed Rules
  **/
  Payload.getRules = function() { return _.values(rules); };

  /**
  * Returns true or false if this was a crawl
  **/
  Payload.isCrawl = function() {

    // get the data
    var data = payload.getData();

    // return the crawl
    return data.crawlid !== null && data.crawlid !== undefined;

  };

  // return the Payload object to use
  return Payload;

};
