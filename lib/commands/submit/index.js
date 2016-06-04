// pull in our required modules
const config        = require('../../config');
const blessed       = require('blessed');
const _             = require('lodash');
const API           = require('../../api');
const url           = require('url');
const Channel       = require('../../utils/channel');
const async         = require('async');
const State         = require('./state');

// pull in our components
const widgetConnect = require('./widgets/connect');
const widgetReport  = require('./widgets/report');

/**
* Adds all our components
**/
var addAllWidgets = function(channel, widgets, screen) {

  // Append our box to the screen.
  var keys = _.keys(widgets);

  // loop widgets and add to scree
  for(var i = 0; i < keys.length; i++) {

    // append
    screen.append( widgets[keys[i]].render(screen) );

    // setup our event handlers
    widgets[ keys[i] ].setChannel(channel);

  }

};

var resetScreen = function(widgets) {

  // Append our box to the screen.
  var keys = _.keys(widgets);

  // loop widgets and add to scree
  for(var i = 0; i < keys.length; i++) {

    // sanity check
    if(!widgets[keys[i]].getElement()) continue;

    // append
    widgets[keys[i]].getElement().hidden = true;

  }

};

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked report requested');

  // get the urls to run
  var urls  = payload.getTargets();

  // if TTY
  if(process.stdout.isTTY === true && payload.getArguments().tty === false) {

    // Create a screen object.
    var screen = blessed.screen({

      smartCSR: true

    });

    /**
    * Creates our list of UI widgets to use
    **/
    var widgets = {

      CONNECT: widgetConnect,
      REPORT: widgetReport

    };

    // split the body given
    var urls = payload.getTargets();

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {

      // cancel the process
      return process.exit(1);

    });

    // append all our widgets
    addAllWidgets(Channel, widgets, screen);

    // start it off by CONNECT
    widgets.CONNECT.getElement().hidden = false;
    screen.render();

  }

  // start our websockets
  Channel.boot();

  // write out our realtime update
  payload.write({

    text: 'Starting Test',
    xml: '<Response>Starting Test</Response>',
    json: { message: "Starting Test" }

  });

  // debug
  State.setChannel(Channel);
  State.on('tracker', function(data) {

    // stream out
    if(payload.getArguments().streaming === true) {

      // get the item
      var item = data.item;

      // based on what type this is
      if(data.type == 'crawl') {

        // write out the streaming updates
        payload.write({

          text: 'Page [' + item.processed + "/" + item.pages + ']',
          json: item,
          xml: ''

        });

      } else {

        // write out the streaming updates
        payload.write({

          text: '',
          json: item,
          xml: ''

        });

      }

    }

  });
  State.once('done', function(data) {

    // the text output
    var textOutput = [
    ];

    // get it
    for(var a = 0; a < data.length; a++) {

      // get the item
      var item = data[a];

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
    payload.setJSON(data);
    payload.setXML('');

    fn(null);

  });

  // based on the provided reports, configure
  async.each(urls, function(targetUrl, cb) {

    if(urls.length > 1) {

      // running multiple reports, check if this is
      // for the next arguments
      if(payload.getArguments().recursive === true) {

        // start a crawl here
        // run just a single page
        cb(null);

      } else {

        // run just a single page
        API.submit(targetUrl, function(err, response) {

          // handle any errors
          if(err) {

            // report the error
            payload.error('Problem reaching service to start page test', err)

            // nope out of here
            return cb(err);

          }

          // register for events to this report
          Channel.subscribe('report' + response.id);

          // add to the tracker
          State.addReport(response, cb);

        });

      }

    } else if(urls.length == 1) {

      // running a single report, check if we do
      // this for the entire site or just the page
      if(payload.getArguments().recursive === true) {

        // start a crawl here
        API.submitCrawl(1, function(err, response) {

          // handle any errors
          if(err) {

            // report the error
            payload.error('Problem reaching service to recursive test', err)

            // nope out of here
            return fn(err);

          }

          // register for events to this report
          Channel.subscribe('crawl' + response.id);

          // add to the tracker
          State.addCrawl(response, cb);

        });

      } else {

        // run just a single page
        API.submit(targetUrl, function(err, response) {

          // handle any errors
          if(err) {

            // report the error
            payload.error('Problem reaching service to start page test', err)

            // nope out of here
            return fn(err);

          }

          // register for events to this report
          Channel.subscribe('report' + response.id);

          // add to the tracker
          State.addReport(response, cb);

        });


      }

    }

  }, function(err) {

    if(err)
      fn(err);

  });

};
