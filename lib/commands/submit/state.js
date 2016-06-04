/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/

/**
* Get our modules
**/
const async         = require('async');
const Constants     = require('../../constants');
const Log           = require('../../utils/log');
const _             = require('lodash');
const EventEmitter  = require('events');

/**
*
**/
State = new EventEmitter();

/**
*
**/
State.trackers = [];

/**
*
**/
State.channel = null;

/**
*
**/
State.queue = async.queue(function (data, cb) {

  // get the type of sections
  processFunc = null;

  if(data.key.indexOf('crawl') == 0) {

    // set to processing function
    processFunc = State.processCrawl;

  } else if(data.key.indexOf('report') == 0) {

    // set to processing function
    processFunc = State.processReport;

  }

  // check if defined
  if(!processFunc) return cb(null);

  // process the change
  processFunc(data, function(err){

    // handle a error
    if(err) return cb(err);

    // process the finish
    State.processFinish(cb);

  });

}, 1);

/**
* Sets the channel that we can use
**/
State.setChannel = function(channel) {

  // assign the local channel
  this.channel = channel;

  // configure the events
  this.channel.on('message', _.bind(function(data) {

    this.queue.push(data);

  }, this));

};

/**
*
**/
State.processFinish = function(fn) {

  // check for done
  if(State.hasStarted === false) return;

  var count = 0;

  for(var i = 0; i < (this.trackers || []).length; i++) {

    if(this.trackers[i].finished === true)
      count++;

  }

  // should match
  if(count == (this.trackers || []).length) {

    // get the items
    var items = [];

    // loop and add all the items
    for(var i = 0; i < (this.trackers || []).length; i++) {

      // add the public item
      items.push(this.trackers[i].item);

    }

    // done
    State.emit('done', items);

    fn(null, true);

  } else fn(null, false);

};

/**
*
**/
State.processCrawl = function(data, fn) {

  // get the item
  var item = data.item;

  // debug
  Log.debug('Received a crawl update for #' + data.crawlid);

  for(var i = 0; i < State.trackers.length; i++) {

    // does it match ?
    if( State.trackers[i].type != 'crawl' ) continue;
    if( State.trackers[i].id != (data.crawlid || data.uid) )
      continue;

    // update the last time we talked
    State.trackers[i].timestamp = new Date().getTime();

    // define if not
    if(!State.trackers[i].item.rules)
      State.trackers[i].item.rules = [];

    // check th eitem
    if(data.action == 'stats') {

      // update our crawl item
      State.trackers[i].item = _.extend({}, State.trackers[i].item, item);

      if(item.status === 40)
        State.trackers[i].finished = true;

    } else if(data.action == 'issue') {

      // flag to track if we found it
      var foundFlag = false;

      // loop all the current rules and update ours
      for(var a = 0; a < State.trackers[i].item.rules.length; a++) {

        // handle it
        if( State.trackers[i].item.rules[a].uid != item.uid ) continue

        // update it
        State.trackers[i].item.rules[a] = _.extend({}, State.trackers[i].item.rules[a], item);

        // found it
        foundFlag = true;

      }

      // add it
      if(foundFlag == false) {

        // add the issue
        State.trackers[i].item.rules.push(item);

      }

    }

    // launch tehe tracker
    State.emit('tracker', State.trackers[i].item);

  }



  // done
  fn(null);

};

/**
*
**/
State.processReport = function(data, fn) {

  // get the item
  var item = data.item;

  // debug
  Log.debug('Received a report update for #' + data.item.id);

  // loop all the trackers
  for(var i = 0; i < State.trackers.length; i++) {

    // does it match ?
    if( State.trackers[i].type != 'report' ) continue;
    if( State.trackers[i].id != data.reportid ) continue;

    // update the last time we talked
    State.trackers[i].timestamp = new Date().getTime();

    if(data.action == 'report') {

      // update the item
      State.trackers[i].item = _.extend({}, State.trackers[i].item, item);

      // check if done
      if(item.status === 'done')
        State.trackers[i].finished = true;

    } else if(data.action == 'test') {

      // loop the test
      for(var a = 0; a < (State.trackers[i].item.tests || []).length; a++) {

        if( State.trackers[i].item.tests[a].id == data.testid ) {

          State.trackers[i].item.tests[a] = _.extend({}, State.trackers[i].item.tests[a], item);

        }

      }

    }

    // launch tehe tracker
    State.emit('tracker', State.trackers[i].item);

  }

  // doe
  fn(null);

};

/**
*
**/
State.addReport = function(item, fn) {

  // subscribe
  this.channel.subscribe('report' + item.id);

  // add the report to track
  var tracker = {

    type: 'report',
    key: 'report' + item.id,
    id: item.id,
    item: item,
    finished: false,
    timestamp: new Date().getTime()

  };

  // add the report to track
  this.trackers.push(tracker);

  // done
  fn(null);

};

/**
*
**/
State.addCrawl = function(data, fn) {

  // set to the item
  var item = data.item;

  // subscribe
  this.channel.subscribe('crawl' + item.id);

  // local tracker reference
  var tracker = {

    type: 'crawl',
    key: 'crawl' + item.id,
    id: item.id,
    item: item,
    finished: false,
    timestamp: new Date().getTime()

  };

  // add the report to track
  this.trackers.push(tracker);

  // done
  fn(null);

};

/**
* Internal function that checks for timeouts every 5 seconds
**/
State.purge = function() {

  for(var i = 0; i < State.trackers.length; i++) {

    if(State.trackers.finished == true) continue;

    // get the duration since we last heard in ms
    var duration = new Date().getTime() - State.trackers.timestamp;

    if( duration <= 10 * 1500 ) continue;

    // timeout :(
    State.trackers.finished  = true;
    State.trackers.timeout   = true;


  }

  State.processFinish(function(err, result) {

    // skip if we are done
    if(result == true) return;

    // run the scheduler again
    State.scheduler = setTimeout(State.purge, 1000 * 5);

  });

};

State.hasStarted = false;
State.start = function(fn) {

  State.hasStarted = true;
  State.scheduler = setTimeout(State.purge, 1000 * 5);
  State.processFinish(function(err, result){

    if(fn) fn(err, result);

  });

};

/**
* Expose the Config
**/
module.exports = exports = State;
