/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/
const net           = require('net');
const args          = require('../utils/args');
const async         = require('async');
const EventEmitter  = require('events');
const _             = require('lodash');
const Log           = require('./log');
const Constants     = require('../constants');
const fs            = require('fs');
const zlib          = require('zlib');

/**
* Get our modules
**/
module.exports = exports = function() {

  /**
  * Create our emitter we can start using
  **/
  var Tunnel = new EventEmitter();

  Tunnel.clients = [];

  /**
  * Connect to the Passmarked tunnel service
  **/
  Tunnel.connect = function(params, fn) {

    if(Tunnel.__instance) return fn(null);

    var client = new net.Socket();

    var tunnelHost  = args.dev == true ? 'localhost' : 'tunnel.passmarked.com';
    var tunnelPort  = args.dev == true ? 5555 : 8443;

    client.connect(tunnelPort, tunnelHost, () => {
  
      Tunnel.__instance = client;
      // Tunnel.__instance.write('test');

      // done
      fn(null);

    });

    client.counter = 0;

    client.on('drain', () => { client.resume(); })

    client.on('data', (data) => {

      var sections = data.toString().split(':');
      if(sections[0] == 'PING') {

        Tunnel.emit('ping')

      } else if(sections[0] == 'WELCOME') {

        Tunnel.emit('welcome', {

          port:   sections[1],
          uid:    sections[2]

        })

      } else if(sections[0] == 'CLOSE') {

        var tunnelClient = null;
        for(var i = 0; i < Tunnel.clients.length; i++) {

          if(Tunnel.clients[i].uid == sections[1]) {

            tunnelClient = Tunnel.clients[i];

          }

        }

        if(tunnelClient) {

          try {

            tunnelClient.end();

          } catch(err) {}

        }

      } else if(sections[0] == 'DATA') {

        var tunnelClient = null;
        for(var i = 0; i < Tunnel.clients.length; i++) {

          if(Tunnel.clients[i].uid == sections[1]) {

            tunnelClient = Tunnel.clients[i];

          }

        }

        if(tunnelClient) {

          var isFlushed = tunnelClient.write(new Buffer(sections[2], 'base64'))
          if(isFlushed === false) tunnelClient.pause();
          else tunnelClient.resume();

        }

        // handle close
        var handleClose = false;

        // give it some time
        var tunnelClient = new net.Socket({});
        tunnelClient.stepCounter = 0;
        // tunnelClient.setTimeout(3000);
        tunnelClient.setNoDelay(true);
        tunnelClient.uid = sections[1];
        Tunnel.clients.push(tunnelClient);

        tunnelClient.on('drain', function() {

          tunnelClient.resume();

        });

        tunnelClient.on('close', function() {

          queue.push({

            command: 'CLOSE'

          })
          
        });

        tunnelClient.on('connect', function() {

          try {

            var isFlushed = tunnelClient.write(new Buffer(sections[2] || '', 'base64'))
            if(isFlushed === false) tunnelClient.pause();
            else tunnelClient.resume();

          } catch(err) {}

        });

        var queue = async.queue(function(task, cb) {

          if(task.command == 'CLOSE') {

            Tunnel.__instance.write('CLOSE:' + tunnelClient.uid + ':;;PM;;', function() {

              tunnelClient.end();
              Tunnel.clients = _.filter(Tunnel.clients, function(item) {

                return item.uid != tunnelClient.uid;

              });
              cb(null);

            })

          } else {

            client.counter = client.counter + 1;
            var isFlushed = Tunnel.__instance.write('DATA:' + tunnelClient.uid + ':' + task.data.toString('base64') + ':' + client.counter + ':;;PM;;')
            if(isFlushed === false) Tunnel.__instance.pause();  
            else tunnelClient.resume(); 
            cb(null);

          }

        }, 1);

        // Tunnel.__instance.write('DATA:' + tunnelClient.uid + ':' + data.toString('base64'))

        // pipe to our own connection
        tunnelClient.on('data', function(data) {

          queue.push({

            data: data

          })

        });
        tunnelClient.connect(params.port, params.host);

      }

    });

    client.on('close', function() {

      client.end();
      Tunnel.emit('close');

    });

  };

  /**
  * Expose the Tunnel
  **/
  return Tunnel;

}
