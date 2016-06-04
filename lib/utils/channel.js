/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/

/**
* Get our modules
**/
const EventEmitter  = require('events');
const _             = require('lodash');
const WebSocket     = require('sockjs-client');

/**
* Internal private variables
**/
var clientSocket    = null;
var subscribedKeys  = [];
var pendingMsgs     = [];
var lastPing        = null;
var welcomeReceived = false;
var reconnectCount  = 0;

/**
*
**/
Channel = new EventEmitter();

/**
*
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

    // if not more than 50 ...
    if( pendingMsgs.length > 50 ) {

      // slice it
      pendingMsgs = pendingMsgs.slice(0, 48);

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

  // get the last time we received a ping
  var waitingPeriod = new Date().getTime() - lastPing.getTime();

  // check if the last ping is more than 20 seconds
  // close the connection and try to reconnect
  if(waitingPeriod > 1000 * 20) {

    console.log('nope, exit now');
    process.exit(1);

  }

  // handle the timeout
  setTimeout(Channel.checkLastPing, 1000 * 10);

};

/**
*
**/
Channel.connect = function() {

  reconnectCount++;

  // don't care, just skip by
  try { clientSocket.close(); } catch(err) {}
  clientSocket = null;

  //
  clientSocket = new WebSocket("https://ws.passmarked.com/ws");
  clientSocket.onopen = function() {

    reconnectCount = 0;

    Channel.emit('open');
    Channel.subscribe('stats');

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

  };

  /**
  * Handle a message from the socket
  **/
  clientSocket.onmessage = function(e) {

    // the final parsed message we need
    var parsedMessage = null;

    // try to parse the message
    try {

      // parse with the native method
      parsedMessage = JSON.parse(e.data);

    } catch(err) {}

    // check if not null
    if(!parsedMessage) return;

    // handle the ping
    if(parsedMessage.key == 'ping') {

      // emit the message
      lastPing = new Date();

    }

    // emit the message
    Channel.emit('message', parsedMessage);

  };
  clientSocket.onerror = function() {

    Channel.emit('error');

  };
  clientSocket.onclose = function() {

    var backoffTimeout = reconnectCount * 1000;

    // check the timeout
    if(reconnectCount >= 30) {

      // nope ...
      console.log('More than a minute of backoff we are calling it here, dead connection');
      process.exit(1);

    }

    console.log('reconnecting again in ' + Math.floor(backoffTimeout/1000) + "s")

    setTimeout(function() {

      Channel.connect();

    }, backoffTimeout);

    Channel.emit('close');

  };

};

/**
*
**/
Channel.setupEventHandlers = function() {};

/**
* Write out to the payload
**/
Channel.send = function(payload) {

  clientSocket.send(JSON.stringify(payload))

};

/**
*
**/
Channel.boot = function() {

  Channel.connect();
  setTimeout(Channel.checkLastPing, 1000 * 15);

};

/**
* Expose the channel
**/
module.exports = exports = Channel;
