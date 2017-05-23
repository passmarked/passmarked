// pull in our required modules
const config        = require('../config');
const _             = require('lodash');
const API           = require('../api');
const url           = require('url');
const Channel       = require('../utils/channel');
const async         = require('async');
const passmarked    = require('../index');
const readline      = require('readline');
const api           = require('../api');
const Constants     = require('../constants');

// add the actual command logic
module.exports = exports = function(payload, fn) {

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

    // check if the user is logged and can submit these requests
    if(config.getToken() === null) {

      // set the status code
      payload.setExecCode(1);

      // no token is present ...
      payload.setText([

        '',
        'To run tests from the terminal client, a valid authenticated',
        'user is required. To authenticate the terminal client run:',
        '',
        '\tpassmarked connect',
        ''

      ].join('\n'));
      payload.setJSON({

        message: 'To run tests first authenticate your terminal client to a user on the system. Run "passmarked connect" to get started.'

      });

      // stop exec
      return fn(null);

    }

    // run the track
    api.track({

      key:      'submit',
      message:  'Submission requested for ' + urls.join(',')

    }, function(){

      // generate a status tracker for each of the urls
      var urlStates = {};

      // add the url
      for(var i = 0; i < (urls || []).length; i++) {

        // add the state
        urlStates[urls[i]] = {

          status: 'STARTING',
          label:  urls[i].toLowerCase().replace(/http\:\/\//gi, '')

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

      };

      // render our state
      renderState();

      // based on the provided reports, configure
      async.each(urls, function(targetUrl, cb) {

        // parse to get the uri
        var uri = url.parse(targetUrl);

        // the last message we logged out
        var lastUpdateMsg = '';
        var reportError   = null;

        // the params to start a report with
        var params = {

          url:          targetUrl,
          token:        config.getToken(),
          command:      payload.getCommand(),
          recursive:    payload.getArguments().recursive === true

        };

        // debug
        payload.debug('Created report with the following params: ' + JSON.stringify(params));

        // go at it
        var report = passmarked.create(params);

        /**
        * Wait till we are done
        **/
        report.on('update', function(result) {

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

              // just set the currennt status
              if(result.getStatus() === 'pending') {

                // set the output
                output = 'queued;'

              } else if(result.getStatus() === 'running') {

                // set the output
                output = 'fetching'

              } else {

                // append
                output = result.getStatus();

              }

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
        * Handle any errors we might get
        **/
        report.on('error', function(err) {

          // set the current error
          reportError = err;

        });

        /**
        * Wait till we are done
        **/
        report.on('done', function(result) {

          // update our state
          urlStates[targetUrl].status = 'DONE';
          renderState();

          // add to the list
          results.push({

            status: reportError ? 'error' : 'ok',
            item:   result,
            error:  reportError,
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
        var textOutput      = [];
        var jsonOutput      = [];
        var failedPageCount = 0;
        var issueCount      = 0;
        var prefix          = '    ';

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

          // generate the preview url
          var previewUrl = result.getPreviewUrl();

          // increment failed count
          if(result.getResult() != 'success') {

            // increment that we found issues
            failedPageCount++;

          }

          // check the result
          if(result.getResult() == 'success') {

            // append to text
            textOutput.push('');
            textOutput.push( prefix + results[i].label + ' (' + result.getScore() + ') - ' + previewUrl );
            textOutput.push('');

            // get the issues
            var issues = result.getIssues();

            // get the number of the passed level
            var levelNumb = Constants.LEVELS[ (payload.getArguments().level || 'notice').toUpperCase() ];
            var filters   = payload.parseFilter(payload.getArguments().filter || '');

            // filter according to viewable rules
            var filteredIssues = _.filter(issues || [], function(issue) {

              // according to configure level
              var issueLevelNumb = Constants.LEVELS[ issue.getLevel().toUpperCase() ];

              // should be more or equal to the configured filter
              if(issueLevelNumb < levelNumb) return false;

              // right next check the filter
              if(filters.length == 0) return true;

              // but it is defined ... 
              var filterCheckResult = false;

              // loop and check the filters
              for(var a = 0; a < filters.length; a++) {

                // count of matches we found
                var matches = 0;

                // check the item
                if(filters[a].category == '*' || 
                    filters[a].category == issue.getCategory()) {

                  // flat to failure
                  matches++;

                }

                // check the item
                if(filters[a].test == '*' || 
                    filters[a].test == issue.getTest()) {

                  // flat to failure
                  matches++;

                }

                // check the item
                if(filters[a].rule == '*' || 
                    filters[a].rule == issue.getUID()) {

                  // flat to failure
                  matches++;

                }

                // we found some matches !
                if(matches === 3) {

                  // set the flag
                  filterCheckResult = true;

                  // done
                  break;

                }

              }

              // done
              return filterCheckResult;


            });

            // sort our issues
            filteredIssues = _.sortBy(filteredIssues || [], function(issue) {

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

              textOutput.push(prefix + 'No matching issues found, but found ' + issues.length + ' rules below the ' + payload.getArguments().level + '. Check ' + previewUrl + ' for all detected issues');

            } else {

              textOutput.push(prefix + 'No issues found :)');

            }

          } else if(result.getResult() == 'timeout') {

            textOutput.push('');
            textOutput.push( prefix + results[i].label + ' - ' + previewUrl );
            textOutput.push('');
            textOutput.push( prefix + 'Page timed out' );

          } else if(result.getResult() == 'invalid') {

            textOutput.push('');
            textOutput.push( prefix + results[i].label + ' - ' + previewUrl );
            textOutput.push('');
            textOutput.push( prefix + 'Page did not return a 200 with the content-type=text/html' );

          } else if(result.getResult() == 'auth') {

            textOutput.push('');
            textOutput.push( prefix + results[i].label + ' - ' + previewUrl );
            textOutput.push('');
            textOutput.push( prefix + 'Page requested authentication using Auth Basic ...' );

          } else if(result.getResult() == 'notfound') {

            textOutput.push('');
            textOutput.push( prefix + results[i].label + ' - ' + previewUrl );
            textOutput.push('');
            textOutput.push( prefix + 'Page reported back as not found (status code - 404)' );

          } else if(result.getResult() == 'failed') {

            textOutput.push('');
            textOutput.push( prefix + results[i].label + ' - ' + previewUrl );
            textOutput.push('');
            textOutput.push( prefix + 'Problem contacting the page, no connection could be made' );

          } else if(result.getResult() == 'expired') {

            textOutput.push('');
            textOutput.push( prefix + results[i].label + ' - ' + previewUrl );
            textOutput.push('');
            textOutput.push( prefix + 'Queue for too long, passmarked.com might be experiencing a tad too much load. Try again in a few minutes after we catch our breath ?' );

          } else {

            textOutput.push('');
            textOutput.push( prefix + results[i].label + ' - ' + previewUrl );
            textOutput.push('');
            textOutput.push( prefix + 'Something went wrong, we have been notified. Try again in a few minutes ?' );

          }

        }

        // set the text output
        payload.setText(textOutput.join('\n') + '\n');
        payload.setJSON(jsonOutput);

        // did we get any ?
        if(issueCount > 0) {

          // set the status code
          payload.setExecCode(1);

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
  
  });

};
