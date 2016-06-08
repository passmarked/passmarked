/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/

/**
* Get our modules
**/
const pkg           = require('../../package.json');
const args          = require('./args');
const colors        = require('colors');
const moment        = require('moment');

/**
*
**/
Logging = {};

/**
* Returns true or false based on if we should log
**/
Logging.shouldLog = function() {

  // return if quite
  return args.quiet === false;

};

/**
* Returns the formatting of the message
**/
Logging.getMessageFormat = function(level, message) {

  // get the configured format
  var format = (args.format || 'text').toLowerCase();

  // depending on the format change what is outputted
  if(format == 'json') {

    // return the format
    return JSON.stringify({

      type: 'log',
      message: message,
      level: level,
      timestamp: new Date().getTime()

    }) + '\n';

  } else if(format == 'xml') {

    // return the format
    return '<Response type="log" timestamp="' + new Date().getTime() + '" level="' + level + '">' + message + '</Response>' + '\n';

  } else {

    // build up the parts
    var parts = [];

    // add the level
    if(args.verbose === true)
      parts.push(level.toUpperCase());

    // add the parts
    parts.push(message);

    // return the format
    return parts + '\n';

  }

};

/**
* Returns a logging format we can use
**/

/**
* Returns the current version
**/
Logging.debug = function(message) {

  // disable if not verbose
  if(args.verbose === false) return;

  // should we log ?
  if(Logging.shouldLog() === false) return;

  // get the message
  var formatMessage = Logging.getMessageFormat(
    'debug',
    message
  );

  // do the actual log
  process.stdout.write(colors.blue(formatMessage));

};

/**
* Returns the current version
**/
Logging.info = function(message) {

  // should we log ?
  if(Logging.shouldLog() === false) return;

  // get the message
  var formatMessage = Logging.getMessageFormat(
    'info',
    message
  );

  // do the actual log
  process.stdout.write(formatMessage);

};

/**
* Returns the current version
**/
Logging.warning = function(message) {

  // should we log ?
  if(Logging.shouldLog() === false) return;

  // get the message
  var formatMessage = Logging.getMessageFormat(
    'warning',
    message
  );

  // do the actual log
  process.stderr.write(colors.yellow(formatMessage));

};

/**
* Alias for warning
**/
Logging.warn    = Logging.warning;

/**
* Returns the current version
**/
Logging.error = function(message, err) {

  // should we log ?
  if(Logging.shouldLog() === false) return;

  // get the message
  var formatMessage = Logging.getMessageFormat(
    'error',
    message
  );

  // do the actual log
  process.stderr.write(colors.red(formatMessage));

  // check if a error was given ?
  if(!err) return;

  // get the message
  var errorFormatMessage = Logging.getMessageFormat(
    'error',
    err.toString()
  );

  // do the actual log
  process.stderr.write(colors.red(errorFormatMessage));

};

/**
* Expose the Logging
**/
module.exports = exports = Logging;
