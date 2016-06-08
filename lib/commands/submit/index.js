// pull in our required modules
const config        = require('../../config');
const _             = require('lodash');
const API           = require('../../api');
const url           = require('url');
const Channel       = require('../../utils/channel');
const async         = require('async');
const passmarked    = require('../../index');
const ProgressBar   = require('progress');

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked report requested');

  // get the urls to run
  var urls  = payload.getTargets();

  // get the results from all of the reports
  var results       = [];

  // count the failed results
  var failedResults = [];

  // debugging
  payload.debug('loading config to get token');

  // build local config to use
  config.build(function(){

    // based on the provided reports, configure
    async.each(urls, function(targetUrl, cb) {

      // parse to get the uri
      var uri = url.parse(targetUrl);

      // starting the reports
      payload.info( 'Starting ' + targetUrl );

      // the last message we logged out
      var lastUpdateMsg = '';

      // the params to start a report with
      var params = {

        url:          targetUrl,
        token:        config.getToken(),
        recursive:    payload.getArguments().recursive === true

      };

      // debug
      payload.debug('Created report with the following params: ' + JSON.stringify(params));

      // go at it
      var report = passmarked.createReport(params);

      /**
      * Wait till we are done
      **/
      report.on('update', function(err) {

        // if marked as stream
        if(payload.getArguments().stream == false) return;

        // get the result from the report
        var result = report.getResult();

        // check format
        if(payload.getArguments().format === 'json') {

          // output json
          payload.info(JSON.stringify(result.toJSON()));

        } else {

          // content
          var output = '';

          // check if a crawl
          if(report.isRecursive()) {

            // output the pages
            // get the output
            var output = uri.hostname + ' - ' + result.countProcessedPages() + '/' + result.countPages();

          } else {

            // output the pages
            // get the output
            var output = targetUrl+ ' - ' + result.countPendingTests() + '/' + result.countTests();

          }

          // check the output
          if(lastUpdateMsg != output) {

            // set our last message
            lastUpdateMsg = output;

            //get the result
            payload.info(output);

          }

        }

      });

      /**
      * Wait till we are done
      **/
      report.on('done', function(err) {

        // get the result from the report
        var result = report.getResult();

        // add to the list
        results.push({

          status: err ? 'error' : 'ok',
          item:   result,
          error:  err,
          url:    report.getURL()

        });

        // done
        cb(null);

      });

      /**
      * Start the actual crawl with provided params
      **/
      report.start(function(err) {

        // handle the error if any
        if(err) {

          // output our err
          payload.error( report.getURL() + ' -- ' + err.toString() );

          // add to the list
          results.push({

            status: 'error',
            item:   {},
            error:  err,
            url:    report.getURL()

          });

          // done
          cb(null);

        }

      });

    }, function(err) {

      // info
      payload.info('Done running reports');

      // so handle a error if we got one
      if(err) payload.error('Problem running reports', data);

      // output that we set the text to
      var textOutput  = [];
      var jsonOutput  = [];

      // set our error
      var returningError = null;

      // loop them all and add text info
      for(var i = 0; i < (results || []).length; i++) {

        // check the type
        if(results[i].status != 'ok') {

          // set our returning error
          returningError = err;

          // NEXT
          continue;

        }

        // local report reference
        var result = results[i].item;

        // append to text
        textOutput.push( result.getURL() + ' -- ' + result.getScore() );

        // get the issues
        var issues = result.getIssues();

        // loop the issues
        for(var a = 0; a < issues.length; a++) {

          // local reference for issue
          var issue = issues[a];

          // use that
          textOutput.push(issue.getCount() + '\t' + issue.getMessage());

        }

        // add our JSON
        jsonOutput.push(result.toJSON());

      }

      // set the text output
      payload.setText(textOutput.join('\n'));
      payload.setJSON(jsonOutput);

      // did we get a error ?
      if(returningError) {

        // output the error instead
        payload.error(textOutput.join('\n'));

        // done
        return fn(returningError);

      }

      // handle the fn
      fn(returningError);

    });

  });

};
