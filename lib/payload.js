/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/

/**
* Get our modules
**/
const config        = require('./config');
const Log           = require('./utils/log');
const args          = require('./utils/args');

/**
*
**/
Payload = {};

/**
* Class wide params
**/
var messages    = [];
var output      = {};
var body        = '';
var command     = '';
var targets     = [];

/**
* Track the outputs we can use
**/
var outputText  = null;
var outputJSON  = null;
var outputXML   = null;

/**
* Streaming interface for logging
**/
Payload.write = function(outputs) {

  if(args.streaming === true) {

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
Payload.setXML = function(xmlString) {

  // set the actual text output
  outputXML = xmlString;

};

/**
* Sets the output JSON for us to use
**/
Payload.setJSON = function(output) {

  // set the actual text output
  outputJSON = output;

};

/**
* Sets the output text for us to use
**/
Payload.setText = function(text) {

  // set the actual text output
  outputText = text;

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
Payload.debug = Log.debug;

/**
* Logs a info out to the system
**/
Payload.info = Log.info;

/**
* Logs a warning out to the system
**/
Payload.warning = Log.warning;
Payload.warn    = Log.warning;

/**
* Logs a error out to the system
**/
Payload.error = Log.error;

/**
* Expose the Payload
**/
module.exports = exports = Payload;
