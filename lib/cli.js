/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/

/**
* Get our modules
**/
const pkg           = require('../package.json');
const Log           = require('./utils/log');
const S             = require('string');
const args          = require('./utils/args');
const Payload       = require('./payload');
const async         = require('async');
const _             = require('lodash');
const fs            = require('fs');
const url           = require('url');
const dns           = require('dns');
const request       = require('request');
const Config        = require('./config');
const stdin         = require('./utils/stdin');

/**
*
**/
Client = {};

/**
* Load in the commands
**/
Client.commands = {

  version:      require('./commands/version'),
  submit:       require('./commands/submit'),
  get:          require('./commands/get'),
  whoami:       require('./commands/token.get'),
  tokenSet:     require('./commands/token.set'),
  balance:      require('./commands/balance'),
  connect:      require('./commands/connect'),
  disconnect:   require('./commands/disconnect'),
  websites:     require('./commands/websites'),
  website:     require('./commands/website')

};

/**
* Creates the current payload for us to use till the end
**/
Client.payload = Payload;

/**
* Returns the current payload
**/
Client.getPayload = function() { return Client.payload; };

/**
* Handles the formatted output
**/
Client.handleOutput = function(err) {

  /**
  * did we get a error ? If so exist with =1,
  * we rely on the commands to output errors
  * as they see we fit in this case.
  **/
  if(err) {

    // exit badly
    return process.exit(1);

  }

  // get the our payload we used
  var payload = Client.getPayload();
  var output  = '';

  // check the format given
  if(args.format == 'json') {

    // output the JSON
    output = payload.getJSON();

  } else {

    // output the text version
    output = payload.getText();

  }

  // should we write out ?
  if( S(args.o).isEmpty() === false ) {

    // yeap write it out to file
    fs.writeFile(args.o, output, function(err) {

      // check the error
      if(err) {

        // output our error
        Log.error('Could not write to the specified output file', err);

      }

      // wait till next callback event
      setTimeout(function() {

        // do the actual exit
        process.exit(0);

      }, 0);

    });

  } else {

    // output the text version
    process.stdout.write(output + '\n', function() {

      // wait till next callback event
      setTimeout(function() {

        // do the actual exit
        process.exit(0);

      }, 0);

    });

  }

};

/**
* Executes the given command
**/
Client.executeCommand = function(path) {

  // make sure to trim the path
  cleanedPath = S(path).trim().s.toLowerCase();

  // get the payload to use
  var payload = Client.getPayload();
  var body    = payload.getBody();

  // according to the path, route our command
  if(cleanedPath == 'version') {

    // route to version
    Client.commands.version(payload, Client.handleOutput);

  } else if(cleanedPath == 'websites') {

    // route to websites
    Client.commands.websites(payload, Client.handleOutput);

  } else if(cleanedPath.indexOf('websites') == 0 && path.split(' ').length == 2) {

    // route to token
    Client.commands.website(payload, Client.handleOutput);

  } else if(cleanedPath.indexOf('get') == 0) {

    // route to token
    Client.commands.get(payload, Client.handleOutput);

  } else if(cleanedPath.indexOf('connect') == 0 && path.split(' ').length == 2) {

    // route to token
    Client.commands.tokenSet(payload, Client.handleOutput);

  } else if(cleanedPath == 'whoami' || cleanedPath == 'me') {

    // route to token
    Client.commands.whoami(payload, Client.handleOutput);

  } else if(cleanedPath == 'connect') {

    // route to version
    Client.commands.connect(payload, Client.handleOutput);

  } else if(cleanedPath == 'disconnect') {

    // route to version
    Client.commands.disconnect(payload, Client.handleOutput);

  } else if(cleanedPath == 'balance') {

    // route to token
    Client.commands.balance(payload, Client.handleOutput);

  } else {

    // find all the urls to run/crawl
    var urls = body.split(args.delimiter || Client.guessDelimiter(body));

    // urls that failed and cleaned
    var cleanedUrls        = [];
    var failedUrls         = [];

    // loop and validate the requested urls
    async.each(urls, function(givenUrl, cb) {

      // skip if empty
      if(S(givenUrl).isEmpty() == true) return cb(null);

      // validate it
      Client.validateURL(givenUrl, function(err, result, parsedUrl) {

        // return the return
        if(result === true) {

          // add as cleaned
          cleanedUrls.push(url.format(parsedUrl));

          // return as good
          return cb(null);

        }

        // ok so this was not a valid givenUrl
        failedUrls.push(givenUrl);

        // log
        Log.error(givenUrl + ' did not validate as a URL', err);

        // done with no problems, move on
        cb(err);

      });

    }, function(err) {

      // handle a error
      if(err) {

        // exit the process
        return process.exit(1);

      }

      // handle a error
      if(failedUrls.length > 0) {

        // exit the process
        return process.exit(1);

      }

      // check if we actually got any to run
      if(cleanedUrls.length == 0) {

        // show the error
        Log.error('No urls supplied, usage - passmarked example.com');

        // done
        process.exit(1);

      }

      // set our payload
      payload.setTargets(cleanedUrls);

      // try to run it
      Client.commands.submit(payload, Client.handleOutput);

    });

  }

};

/**
* Tries to figure out what the delimiter is
**/
Client.guessDelimiter = function(body) {

  // the max we found on one of the options
  var max           = 0;

  // the final delimiter we want got from the guess
  var delimiter     = null;

  // list of delimiters we have seen
  var delimiters    = [ '\n', ',', '|', '\t', '\r\n' ];

  // loop each and find check if bigger than max
  for(var i = 0; i < delimiters.length; i++) {

    // get the count of a split
    var count = body.split(delimiters[i]).length;

    // split the string
    if(count > max) {

      // set the new max
      max       = count;
      delimiter = delimiters[i];

    }

  }

  // default to newline
  return delimiter || '\n';

};

/**
* Prefixes http:// if not present
**/
Client.prefixMissingProtocol = function(givenUrl) {

  // if already specified just return
  if( S( givenUrl.toLowerCase() ).startsWith('http://') )
    return givenUrl;

  // else return it now
  return 'http://' + givenUrl;

};

/**
* Validates the body before starting a report
**/
Client.validateURL = function(givenUrl, fn) {

  // clean the url
  var cleanedURL  = S(givenUrl).trim().s;

  // add missing protocol if not present
  cleanedURL      = Client.prefixMissingProtocol(givenUrl);

  // url we are going to be using after parse
  var uri         = null;

  try {

    // parse the url
    uri = url.parse(cleanedURL);

  } catch(err) { /** Override with our error **/ }

  // did we get a uri component ?
  if(!uri) return fn(null, false);

  // ok so parse out the hostname
  var hostname    = uri.hostname;
  var ip          = null;

  // must be either a ip or a
  if(
    hostname.match(/[\d]+\.[\d]+\.[\d]+\.[\d]+/gi) ||
    hostname.match(/(([a-zA-Z0-9]{1,4}|):){1,7}([a-zA-Z0-9]{1,4}|:)/gi)) {

    // it's a ip already
    ip = hostname;

    // awesome move on
    fn(null, true, uri);

  } else {

    // try to resolve the domain
    dns.lookup(hostname, {}, function(err, address, family) {

      // did we get a error ?
      if(err) {

        // what type of error ?
        return fn(err, false);

      }

      // sanity check that we got a address ?
      if(!address) return fn(null, false);

      // got the the ip
      ip = address;

      // awesome move on
      fn(null, true, uri);

    });

  }

};

/**
* Starts the actual CLI client
**/
Client.boot = function() {

  // create our config file
  Config.build(function(){

    // set our payload command
    Client.getPayload().setCommand(args._.join(' '));

    /**
    * Checks if any actual path arguments
    * were given
    **/
    if(args.in) {

      /**
      * Read the file in
      **/
      fs.readFile(args.in, function(err, data) {

        // handle a error if any
        if(err) {

          // output to log
          Log.error('Something went wrong while reading in the input file', err);

          // exit with a 1
          return process.exit(1);

        }

        // set the content that we read in
        Client.getPayload().setBody( data.toString() );

        // Find the command
        Client.executeCommand( Client.getPayload().getCommand() );

      });

    } else if(!args._[0]) {

      /**
      * Start reading in the STDIN
      **/
      stdin.read(function(err, content){

        // handle a error if any
        if(err) {

          // output to log
          Log.error('Something went wrong while reading STDIN', err);

          // exit with a 1
          return process.exit(1);

        }

        // set the content that we read in
        Client.getPayload().setBody(content);

        // Find the command
        Client.executeCommand( Client.getPayload().getCommand() );

      });

    } else {

      // set the body as the params passed
      Client.getPayload().setBody( Client.getPayload().getCommand() );

      // execute the actual command
      Client.executeCommand(Client.getPayload().getCommand());

    }

  });

};

/**
* Expose the Client
**/
module.exports = exports = Client;
