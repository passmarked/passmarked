// pull in our required modules
const config        = require('../../config');
const _             = require('lodash');
const API           = require('../../api');
const url           = require('url');
const Channel       = require('../../utils/channel');
const async         = require('async');
const State         = require('./state');
const ReportOutput  = require('./output');
const passmarked    = require('../../index');

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked report requested');

  // get the params

  // get the urls to run
  var urls  = payload.getTargets();

  // get the results from all of the reports
  var results       = [];

  // count the failed results
  var failedResults = [];

  // build local config to use
  config.build(function(){

    // based on the provided reports, configure
    async.each(urls, function(targetUrl, cb) {

      // go at it
      var report = passmarked.createReport({

        url:          targetUrl,
        token:        config.getToken(),
        recursive:    payload.getArguments().recursive === true

      });

      /**
      * Handle any errors
      **/
      report.on('error', function(err) {

        // output our err
        if(err) payload.error(err.toString())

        // cound the failed results
        failedResults.push(targetUrl);

        // done
        cb(null)

      });

      /**
      * Wait till we are done
      **/
      report.on('done', function() {

        // get the result from the report
        var result = report.getResult();

        // add to the list
        results.push(result);

        // done
        cb(null)

      });

      /**
      * Start the actual crawl with provided params
      **/
      report.start(function(err) {

        // handle the error if any
        if(err) {

          // output our err
          payload.error(err.toString())

          // cound the failed results
          failedResults.push(targetUrl);

          // done
          cb(null);

        }

        // great it's running now !
        // nothing else to do here :)

      });

    }, function(err) {

      console.dir(results);
      fn(null);

    });

  });

};
