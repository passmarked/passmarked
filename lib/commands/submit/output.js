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
const args          = require('../../utils/args');
const Log           = require('../../utils/log');
const _             = require('lodash');
const EventEmitter  = require('events');

/**
*
**/
Output = {};

Output.progressUpdate = function(payload, items, fn) {

  // stream out
  if(payload.getArguments().streaming === true) return;

  // if TTY
  // if(process.stdout.isTTY === false || payload.getArguments().tty === true) return;

  var status = [];

  for(var a = 0; a < items.length; a++) {

    var done = 0;
    var count = 0;

    // local reference
    var tracker = State.trackers[a];
    var item    = tracker.item;
    var label   = item.url || item.domain;

    // get our counts
    if(args.recursive === false) {

      // loop the tests
      for(var i = 0; i < (tracker.item.tests || []).length; i++) {

        // increment count
        count++;

        // add one to done if the test is done processing
        if(tracker.item.tests[i].status == 40)
          done++;

      }

    } else {

      count = tracker.item.pages;
      done = tracker.item.processed;

    }

    // add to info
    status.push(label + ' - ' + done + '/' + count);

  }

  // write out to standard in
  process.stderr.write('\r' + status.join(', '));

};

Output.stream = function(payload, tracker, fn) {

  // stream out
  if(payload.getArguments().streaming === false) return;

  // get the item
  var item = tracker.item;

  // based on what type this is
  if(args.recursive === false) {

    // write out the streaming updates
    payload.write({

      text: 'Page [' + item.processed + "/" + item.pages + ']',
      json: item,
      xml: ''

    });

  } else {

    // write out the streaming updates
    payload.write({

      text: 'Report Stream Here',
      json: item,
      xml: ''

    });

  }

  // done
  if(fn) fn(null);

};

Output.format = function(payload, items, fn) {

  // the text output
  var textOutput = [
  ];

  // get it
  for(var index = 0; index < items.length; index++) {

    // get the item
    var item = items[index];

    // the list
    var rules = item.rules || [];

    // set the issues from the report
    for(var i = 0; i < (item.tests || []).length; i++) {

      for(var a = 0; a < (item.tests[i].rules || []).length; a++) {

        rules.push(item.tests[i].rules[a]);

      }

    }

    // sort my rules
    var sortedRules = _.sortBy(rules || [], function(item) {

      var level = item.level || item.type;
      if(level == 'info') return 10;
      else if(level == 'warning') return 20;
      else if(level == 'error') return 30;
      else if(level == 'critical') return 40;
      else return 50;

    });

    // add the rules
    for(var i = 0; i < sortedRules.length; i++) {

      // add each
      textOutput.push('-> [' + (sortedRules[i].level || sortedRules[i].type) + '] ' + sortedRules[i].message + ' broken ' + sortedRules[i].count + ' times over ' + sortedRules[i].pages + ' pages');

    }

  }

  payload.setText(textOutput.join('\n'));
  payload.setJSON(items);
  payload.setXML('');

  if(fn) fn(null);

};

/**
* Expose the Config
**/
module.exports = exports = Output;
