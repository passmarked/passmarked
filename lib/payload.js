/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/

/**
* Get our modules
**/
const config        = require('./config');
const constants     = require('./constants');
const S             = require('string');
const Log           = require('./utils/log');
const args          = require('./utils/args');

/**
*
**/
var Payload = {};

/**
* Class wide params
**/
var messages    = [];
var output      = {};
var body        = '';
var command     = '';
var targets     = [];
var execCode    = 0;

/**
* Track the outputs we can use
**/
var outputText  = null;
var outputJSON  = null;
var outputXML   = null;
var lastTime    = new Date();

/**
* Signals that we are still alive and beating
**/
Payload.touch = function() { lastTime = new Date(); };

/**
* Returns the datetime object of last activity
**/
Payload.getLastActive = function() { return lastTime; };

/**
* Streaming interface for logging
**/
Payload.write = function(outputs, override) {

  // set new time
  lastTime = new Date();

  if(override === true) {

    // output the normal text
    process.stdout.write(outputs + '\n');

  } else if(args.streaming === true) {

    // check the format
    if(args.format == 'json') {

      // write out the json object
      process.stdout.write(JSON.stringify(outputs[args.format]) + '\n');

    } else if(args.format == 'xml') {

      // write it out
      process.stdout.write(outputs[args.format] + '\n');

    } else {

      // output the normal text
      process.stdout.write(outputs[args.format] + '\n');

    }

  }

};

/**
* Sets the status we will exit with
**/
Payload.setExecCode = function(code) { execCode = code; };

/**
* Returns the code the program will exit with
**/
Payload.getExecCode = function() { return execCode; };

/**
* Sets the command parameter, this is the passed arguments,
* merged into one string for easier routing and use
**/
Payload.setCommand = function(newCommand) { command = newCommand; };

/**
* Returns the full command path
**/
Payload.getCommand = function() { return command; };

/**
* Sets the targets that we are going to be testing ..
**/
Payload.setTargets = function(urls) { targets = urls; };

/**
* Gets the targets that we need to test
**/
Payload.getTargets = function() { return targets; };

/**
* Sets the "body" of the request
**/
Payload.setBody = function(newBody) { body = newBody; };

/**
* Returns the "body" of the request passed
**/
Payload.getBody = function() { return body; };

/**
* Returns the output for TEXT
**/
Payload.getText = function() { return outputText; };

/**
* Returns the output for TEXT
**/
Payload.getJSON = function() { return JSON.stringify(outputJSON); };

/**
* Returns the output for TEXT
**/
Payload.getXML = function() { return outputXML; };

/**
* Sets the output XML for us to use
**/
Payload.setXML = function(output) {

  // set new time
  lastTime = new Date();

  // debugging
  Payload.debug('XML Set to: ' + output);

  // set the actual text output
  outputXML = output;

};

/**
* Sets the output JSON for us to use
**/
Payload.setJSON = function(output) {

  // set new time
  lastTime = new Date();

  // debugging
  Payload.debug('JSON Set to: ' + JSON.stringify(output));

  // set the actual text output
  outputJSON = output;

};

/**
* Sets the output text for us to use
**/
Payload.setText = function(output) {

  // set new time
  lastTime = new Date();

  // debugging
  Payload.debug('TEXT Set to: ' + output);

  // set the actual text output
  outputText = output;

};

/**
* Returns the arguments given
**/
Payload.getArguments = function() { return args; };

/**
* Returns the current version
**/
Payload.getLog      = function() { return Log; };

/**
* Returns true or false depending on if we should output the logs
**/
Payload.shouldLog   = function() { return Payload.getArguments().quiet === false; };

/**
* Logs a debug out to the system
**/
Payload.debug = function(message) {

  // set new time
  lastTime = new Date();

  // pass it along
  Log.debug(message);

}; 

/**
* Logs a info out to the system
**/
Payload.info = function(message) {

  // set new time
  lastTime = new Date();

  // pass it along
  Log.info(message);

};

/**
* Logs a warning out to the system
**/
Payload.warning = function(message) {

  // set new time
  lastTime = new Date();

  // pass it along
  Log.warning(message);

};
Payload.warn    = Payload.warning;

/**
* Logs a error out to the system
**/
Payload.error = function(message, err) {

  // set new time
  lastTime = new Date();

  // pass it along
  Log.error(message, err);

};

/**
* Parses the filter given into something we can use
**/
Payload.parseFilter = function(filterArgument) {

  // right first check if not empty
  if(S(filterArgument).isEmpty() === true) return [];

  // then divide up multiple filters given
  var filters = filterArgument.toLowerCase().split(',');

  // the filters to return
  var results = [];

  // loop all of them and parse
  for(var i = 0; i < filters.length; i++) {

    // split this too now
    var sections = filters[i].split('.');

    // the params to populate for this specific filter
    var filterCategory  = '*';
    var filterTest      = '*';
    var filterRule      = '*';

    // item checked
    var currentCheckedItem = 0;

    // check if the first is not a category
    if(sections[currentCheckedItem] &&
        constants.CATEGORIES.indexOf(sections[currentCheckedItem]) !== -1) {

      // specify the filter
      filterCategory = sections[currentCheckedItem];

      // increment hhe checked number
      currentCheckedItem++;

    }

    // check if the first is not a category
    if(sections[currentCheckedItem] && sections[currentCheckedItem] != '*') {

      // specify the filter
      filterTest = sections[currentCheckedItem];

      // increment hhe checked number
      currentCheckedItem++;

    }

    // check if the first is not a category
    if(sections[currentCheckedItem] && sections[currentCheckedItem] != '*') {

      // specify the filter
      filterRule = sections.slice(currentCheckedItem, sections.length);

      // increment hhe checked number
      currentCheckedItem++;

    }

    // add to list
    results.push({

      category:     filterCategory,
      test:         filterTest,
      rule:         filterRule

    })

  }

  // done
  return results;

};

/**
* Expose the Payload
**/
module.exports = exports = Payload;
