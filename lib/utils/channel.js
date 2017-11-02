/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/
const EventEmitter  = require('events');
const _             = require('lodash');
const Log           = require('./log');
const Constants     = require('../constants');
const WebSocket     = require('ws');

/**
* Get our modules
**/


module.exports = exports = function(options) {

  /**
  * Internal private variables
  **/
  var clientSocket    = null;
  var subscribedKeys  = [];
  var pendingMsgs     = [];
  var lastPing        = null;
  var connected       = null;
  var WEBSOCKET_URL   = (options || {}).url || null;

  /**
  * Create our emitter we can start using
  **/
  var Channel = new EventEmitter();

  /**
  * Subscribe to a key, this is limited to
  * 10 keys on the wss server as this server
  * was meant was a quick connect, get data
  * then disconnect.
  **/
  Channel.subscribe = function(key) {

    // clean up the key
    var cleanedKey = key.toLowerCase();

    // if not in list already
    if(subscribedKeys.indexOf(cleanedKey) === -1)
      subscribedKeys.push(key);

    // send the subscribe option
    try {

      // try to send
      clientSocket.send(JSON.stringify({ key: key }))

    } catch(err) {

      // if not more than 10 ...
      if( pendingMsgs.length > 10 ) {

        // slice it
        pendingMsgs = pendingMsgs.slice(0, 10);

      }

      // nope add to log
      pendingMsgs.push(JSON.stringify({ key: key }));

    }

  };

  /**
  * Returns true if connected
  **/
  Channel.checkLastPing = function() {

    // must have received a ping ... ?
    if(!lastPing) return;

    // handle the timeout
    Channel.timeoutTimer = setTimeout(Channel.checkLastPing, 1000 * Constants.TIMEOUT);

  };

  /**
  * Call done
  **/
  Channel.handleCallback = function(err, result){

    // handle the item
    if(err)
      this.emit('error', err);

    // emit the close event
    this.emit('close');

    // stop it
    this.removeAllListeners();

  };

  /**
  * Connect and hook up the events of the
  * socket that we can use.
  **/
  Channel.connect = function() {

    // connect to our native websocket server
    // that will stream this data out for us
    clientSocket = new WebSocket(WEBSOCKET_URL);

    /**
    * Execute if it takes too long to open the connection
    **/
    Channel.connectionTimer = setTimeout(function() {}, 1000 * Constants.TIMEOUT);

    /**
    * Handle the open event from the socket
    **/
    clientSocket.on('open', function() {

      // clear the connection timeout
      if(Channel.connectionTimer)
        clearTimeout(Channel.connectionTimer);

      // add a timestamp
      connected = new Date();

      // set the last ping when we last connected
      lastPing = new Date();

      // loop our pre-registered keys
      for(var i = 0; i < subscribedKeys.length; i++) {

        // subscribe
        Channel.subscribe(subscribedKeys[i]);

      }

      // loop our pre-registered keys
      for(var i = 0; i < pendingMsgs.length; i++) {

        // subscribe
        Channel.send(pendingMsgs[i]);

      }

      // clear the messages
      pendingMsgs = [];

      // handle the timeout
      Channel.timeoutTimer = setTimeout(Channel.checkLastPing, 1000 * Constants.TIMEOUT);

    });

    /**
    * Handle a message from the socket
    **/
    clientSocket.on('message', function(data) {

      // the final parsed message we need
      var parsedMessage = null;

      // try to parse the message
      try {

        // parse with the native method
        parsedMessage = JSON.parse(data);

      } catch(err) {}

      // check if not null
      if(!parsedMessage) return;

      // handle the ping
      if(parsedMessage.key === 'ping') {

        // emit the message
        lastPing = new Date();

      } else if(parsedMessage.key === 'welcome') {

        // wait till we are ready
        Channel.emit('ready');

      } else {

        // emit the message
        Channel.emit('message', parsedMessage);

      }

    });

    /**
    * Handle a error on the connection
    **/
    clientSocket.on('error', function(err) {

      /**
      * Close the socket
      **/
      Channel.handleCallback(err);

      /**
      * Close our local client socket
      **/
      Channel.close();

    });
    clientSocket.on('close', function() {

      /**
      * Close the socket
      **/
      Channel.handleCallback(null);

      /**
      * Close our local client socket
      **/
      Channel.close();

    });

  };

  /**
  * Write out to the payload
  **/
  Channel.send = function(payload) {

    // send it out
    console.dir(payload)

    try {

      // send out
      clientSocket.send(JSON.stringify(payload));

    } catch(err) {}

  };

  /**
  * Close the channel
  **/
  Channel.close = function() {

    // remove all events from socket
    try {

      // remove them ALL
      clientSocket.removeAllListeners();

    } catch(err) {}

    // close the socket
    try {

      // close it
      clientSocket.finalize(true);
      clientSocket.close();

    } catch(err) { console.dir(err) }

  };

  /**
  * Expose the channel
  **/
  return Channel;

}
