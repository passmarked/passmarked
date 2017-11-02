/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/

/**
* Get our modules
**/
const pkg           = require('../package.json');
const fs            = require('fs');
const Constants     = require('./constants');
const args          = require('./utils/args');
const Log           = require('./utils/log');
const _             = require('lodash');
const S             = require('string');

/**
*
**/
var Config = {

  data: {}

};

/**
* Returns the token if any
**/
Config.getLang = function() { return require('../lang/en.json'); };

/**
* sets the token
**/
Config.setToken = function(token) {

  // returns the token or null
  this.data = _.extend(this.data, {

    token: token

  });

};

/**
* Returns the Website API
**/
Config.getAPIURL = function(path) {

  // check if in development
  if(args.dev == true) {

    // return the response
    return Constants.DEV_API_URL + (path || '');

  }

  // returns the token or null
  return Constants.API_URL + (path || '');

};

/**
* Returns the Website WSS
**/
Config.getWebsocketSocketURL = function() {

  // check if in development
  if(args.dev) {

    // return the response
    return Constants.DEV_WSS_URL;

  }

  // returns the token or null
  return Constants.WSS_URL;

};

/**
* Returns the Website URL
**/
Config.getWebsiteURL = function(path) {

  // check if in development
  if(args.dev) {

    // return the response
    return Constants.DEV_WEB_URL + (path || '');

  }

  // returns the token or null
  return Constants.WEB_URL + (path || '');

};

/**
* Returns the given config file
**/
Config.getFile = function() {

  // check if a custom config file was given
  if(S(args.config).isEmpty() === false) {

    // return the file
    return args.config;

  } else {

    // return the default
    return Constants.CONFIG_FILE;

  }

};

/**
* Returns the token if any
**/
Config.getToken = function() {

  // returns the token or null
  return process.env.PM_TOKEN || args.token || (this.data || {}).token || null;

};

/**
* Creates the initial config file
**/
Config.init = function(fn) {

  // check if token not set manually
  if(Config.getToken() !== null) return fn(null, false);

  // load in library
  const api = require('./api');

  // report install
  api.track({

    key:      'setup',
    message:  'First run of the Passmarked CLI'

  }, function() {

    // debugging
    Log.debug('Init config file from ' + Config.getFile());

    // set to the initial state
    this.data = Constants.BASIC_CONFIG;

    /**
    * write to the file
    **/
    fs.writeFile(

      Config.getFile(),
      JSON.stringify(Constants.BASIC_CONFIG),
      function(errr) {

        // indicate that this is a new run
        fn(err, true);

      }

    );

  });

};

/**
* Saves the config to the passmarked config file
**/
Config.save = function(fn) {

  // debugging
  Log.debug('Saving config file to ' + Config.getFile());

  /**
  * write to the file
  **/
  fs.writeFile(

    Config.getFile(),
    JSON.stringify(_.extend(

      {},
      Constants.BASIC_CONFIG,
      this.data

    )),
    fn

  );

};

/**
* Builds up the config from the config file on
* the users system if present
**/
Config.build = function(fn) {

  // debugging
  Log.debug('Reading config file from ' + Config.getFile());

  // get the
  fs.stat(Config.getFile(), function(err, stats) {

    // does the file exist ?
    if(stats && stats.isFile()) {

      // read in the file
      return fs.readFile(Config.getFile(), function(err, data){

        // check for a error
        if(err) {

          // output the error
          Log.error('Something went wrong while reading the config file', err);

          // return
          return fn(err, false);

        }

        // debugging
        Log.debug('Loaded config from ' + Config.getFile() + '\n' + data.toString());

        // set the config from the file
        Config.data = JSON.parse(data.toString());

        // done
        fn(null, false);

      });

    }

    // else create the file
    Config.init(fn);

  });

};

/**
* Returns the current version
**/
Config.getVersion = function() { return pkg.version; };

/**
* Expose the Config
**/
module.exports = exports = Config;
