// pull in our required modules
const S             = require('string');
const dns           = require('dns');
const url           = require('url');
const config        = require('../config');
const Tunnel        = require('../utils/tunnel')

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // disable timeouts
  payload.disableTimeouts();

  // get the token variable
  var sections    = payload.getCommand().split(' ');
  var target      = (sections[1] || '');
  var uri           = url.parse(target);
  var targetHost  = 'localhost';
  var targetPort  = 80;

  if(S(target).isEmpty() === false && 
      S(target).isNumeric() === true) {

    targetPort = parseInt(target);

  } else if(S(uri.hostname).isEmpty() === false && 
              S(uri.port).isEmpty() === false && 
                S(uri.port).isNumeric() === true) {

    targetHost = uri.hostname;
    targetPort = parseInt(uri.port);

  } else if(S(uri.hostname).isEmpty() === false) {

    targetHost = uri.hostname;

    if(uri.protocol == 'https:') {

      targetPort = 443;

    } else {

      targetPort = 80;

    }

  } else {

    // debug
    payload.error('Specify a remote host and/or port');

    // exit
    process.exit(1)

    // done
    return fn(null);

  }

  // try to resolve the domain
  dns.lookup(targetHost, {}, function(err, address, family) {

    // did we get a error ?
    if(err && err.code != 'ENOTFOUND') {

      // what type of error ?
      return fn(err, false);

    }

    var tunnel = Tunnel({});

    // Output the passmarked module version
    payload.info('Setting up tunnel to ' + targetHost + ":" + targetPort);

    // handle the connection
    tunnel.connect({

      host:   targetHost,
      port:   targetPort

    }, function() {

      // Output the passmarked module version
      payload.info('Waiting for welcome');

    })

    tunnel.on('welcome', function(params) {

      payload.info('Tunnel running at:\n\n\t* TCP Tunnel - http://tunnel.passmarked.com:' + params.port + '/\n');

    });

    tunnel.on('close', function() {

      // debug
      payload.info('Closing tunnel');

      // exit
      process.exit(1)

      // done
      fn(null);

    });

  });

};
