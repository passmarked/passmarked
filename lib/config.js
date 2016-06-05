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
Config = {

  data: {}

};

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
  return (this.data || {}).token || null;

};

/**
* Creates the initial config file
**/
Config.init = function(fn) {

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
    fn

  );

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

    // check for error
    if(err) {

      // sedn out over stderr
      Log.error('Error while trying to #stat config file', err);

    }

    // does the file exist ?
    if(stats && stats.isFile()) {

      // read in the file
      return fs.readFile(Config.getFile(), function(err, data){

        // check for a error
        if(err) {

          // output the error
          Log.error('Something went wrong while reading the config file', err);

          // return
          return fn(err);

        }

        // debugging
        Log.debug('Loaded config from ' + Config.getFile() + '\n' + data.toString());

        // set the config from the file
        Config.data = JSON.parse(data.toString());

        // done
        fn(null);

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
