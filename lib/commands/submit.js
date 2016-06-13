// pull in our required modules
const config        = require('../config');
const _             = require('lodash');
const API           = require('../api');
const url           = require('url');
const Channel       = require('../utils/channel');
const async         = require('async');
const passmarked    = require('../index');
const readline      = require('readline');
const Constants     = require('../constants');

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked report requested');

  // get the urls to run
  var urls  = payload.getTargets();

  // get the results from all of the reports
  var results         = [];

  // count the failed results
  var failedResults   = [];

  // debugging
  payload.debug('loading config to get token');

  // build local config to use
  config.build(function(){

    // generate a status tracker for each of the urls
    var urlStates = {};

    // add the url
    for(var i = 0; i < (urls || []).length; i++) {

      // add the state
      urlStates[urls[i]] = {

        status: 'STARTING',
        label:  urls[i].toLowerCase().replace('http://', '').replace('https://')

      };

    }

    /**
    * Renders from the state object
    **/
    var renderState = function() {

      // get the text
      var textStrs  = [];
      var keys      = _.keys(urlStates);

      // loop the states
      for(var i = 0; i < keys.length; i++) {

        // add to list
        textStrs.push(urlStates[keys[i]].label + ' (' + urlStates[keys[i]].status + ')');

      }

      // write on same line again and again
      // readline.cursorTo(process.stdout, 0);
      process.stdout.clearLine();  // clear current text
      process.stdout.cursorTo(0);  // move cursor to beginning of line
      process.stdout.write(textStrs.join(', '));
      // console.log(textStrs.join(', '));

    };

    // render our state
    renderState();

    // based on the provided reports, configure
    async.each(urls, function(targetUrl, cb) {

      // parse to get the uri
      var uri = url.parse(targetUrl);

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

        // get the result from the report
        var result = report.getResult();

        // check format
        if(payload.getArguments().format === 'json' &&
             payload.getArguments().stream == true) {

          // output json
          payload.info(JSON.stringify(result.toJSON()));

        } else {

          // content
          var output = '';

          // check if a crawl
          if(report.isRecursive()) {

            // output the pages
            // get the output
            output = result.countProcessedPages() + '/' + result.countPages() + ' pages';

          } else {

            // output the pages
            // get the output
            var delta       = result.countTests() - result.countPendingTests();
            var percentage  = Math.ceil( (delta / result.countTests()) * 100 );

            // we fake a 100% to make it feel more natural as we wait for the
            // final "close" from the server.
            if(percentage == 100) percentage = 99;

            // append
            output = percentage + '%';

          }

          // check the output
          if(lastUpdateMsg != output) {

            // set our last message
            lastUpdateMsg = output;

            // limit the amount of re-renders we do
            urlStates[targetUrl].status = output;
            renderState();

          }

        }

      });

      /**
      * Wait till we are done
      **/
      report.on('done', function(err) {

        // get the result from the report
        var result = report.getResult();

        // update our state
        urlStates[targetUrl].status = 'DONE';
        renderState();

        // add to the list
        results.push({

          status: err ? 'error' : 'ok',
          item:   result,
          error:  err,
          label:  report.getFriendlyName(),
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
            label:  report.getFriendlyName(),
            url:    report.getURL()

          });

          // report failed
          urlStates[targetUrl] = 'ERROR';

          // done
          cb(null);

        }

      });

    }, function(err) {

      // clear the lines
      process.stdout.clearLine();
      process.stdout.cursorTo(0);

      // so handle a error if we got one
      if(err) payload.error('Problem running reports', data);

      // output that we set the text to
      var textOutput  = [];
      var jsonOutput  = [];
      var issueCount  = 0;

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

        // the prefix to use
        var prefix          = '    ';

        // local report reference
        var result = results[i].item;

        // generate the preview url
        var previewUrl = [

          Constants.WEB_URL,
          result.getDomain(),
          result.getUID().slice(0, 4),
          result.getUID().slice(4, 6),
          result.getUID()

        ].join('/');

        // append to text
        textOutput.push('');
        textOutput.push( prefix + results[i].label + ' (' + result.getScore() + ') - ' + previewUrl );
        textOutput.push('');

        // get the issues
        var issues = result.getIssues();

        // get the number of the passed level
        var levelNumb = Constants.LEVELS[ payload.getArguments().level.toUpperCase() ];

        // filter according to viewable rules
        var filteredIssues = _.filter(issues || [], function(issue) {

          // according to configure level
          var issueLevelNumb = Constants.LEVELS[ issue.getLevel().toUpperCase() ];

          // should be more or equal to the configured filter
          return issueLevelNumb >= levelNumb;

        });

        // sort our issues
        var filteredIssues = _.sortBy(filteredIssues || [], function(issue) {

          // return the issue
          return -Constants.LEVELS[ issue.getLevel().toUpperCase() ];

        });

        // check if we have issues ?
        if(filteredIssues.length > 0) {

          // append the length
          issueCount += filteredIssues.length;

          // loop the issues
          for(var a = 0; a < filteredIssues.length; a++) {

            // local reference for issue
            var issue = filteredIssues[a];

            // use that
            textOutput.push(prefix + issue.getLevel() + '\t' + issue.getMessage());

          }

          // add our JSON
          jsonOutput.push(result.toJSON());

        } else if(issues.length > 0) {

          textOutput.push(prefix + 'No matching issues found, but found ' + issues.length + ' rules below the ' + payload.getArguments().level);

        } else {

          textOutput.push(prefix + 'No issues found :)');

        }

      }

      // set the text output
      payload.setText(textOutput.join('\n') + '\n');
      payload.setJSON(jsonOutput);

      // did we get any ?
      if(issueCount > 0) {

        // check the formatting
        if(payload.getArguments().format === 'json') {

          // output the JSON
          return process.stdout.write(JSON.stringify(jsonOutput) + '\n', function() {

            // output our error
            fn(new Error('Found issues on the site'));

          });

        } else {

          // write out our issues
          return process.stdout.write(textOutput.join('\n') + '\n', function() {

            // output our error
            fn(new Error('Found issues on the site'));

          });

        }

      }

      // handle the fn
      fn(returningError);

    });

  });

};
