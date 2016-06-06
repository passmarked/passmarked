// pull in our required modules
const config        = require('../../config');
const _             = require('lodash');
const API           = require('../../api');
const url           = require('url');
const Channel       = require('../../utils/channel');
const async         = require('async');
const State         = require('./state');
const ReportOutput  = require('./output');

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked report requested');

  // get the urls to run
  var urls  = payload.getTargets();

  // start the channel
  var channel = new channel();

  // start our websockets
  channel.boot();

  // write out our realtime update
  payload.write({

    text: 'Letting Passmarked know to start the reports',
    xml: '<Response type="system">Letting Passmarked know to start the reports</Response>',
    json: { type: 'system', message: "Letting Passmarked know to start the reports" }

  });

  // debug
  State.setchannel(channel);
  State.on('tracker', function(data) {

    // handle streaming the data out
    ReportOutput.stream(payload, data);
    ReportOutput.progressUpdate(payload, State.trackers);

  });
  State.once('done', function(data) {

    // clear our progress line
    process.stderr.write('\r');

    // format the output
    ReportOutput.format(payload, data, fn);

  });

  // check if not a dry run
  if(payload.getArguments().dry === true) return;

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
          channel.subscribe('report' + response.id);

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
          channel.subscribe('crawl' + response.id);

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
          channel.subscribe('report' + response.id);

          // add to the tracker
          State.addReport(response, cb);

        });


      }

    }

  }, function(err) {

    if(err)
      fn(err);

    State.start();

  });

};
