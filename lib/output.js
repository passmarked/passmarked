
'use strict';

var _ = require('./colours');
var args = require('./argv');
var log = require('./log');

module.exports = function(results) {
  var result;

  if (args.output && args.json) {
    log.write(args.pretty ? JSON.stringify(results, null, '\t') : JSON.stringify(results));
  } else if (args.json && !args.output) {
    console.log(args.pretty ? JSON.stringify(results, null, '\t') : JSON.stringify(results));
  } else if (args.output && !args.json) {
    for (result in results) {
      log.write(results[result].results.address + ': ' + results[result].results.score + '\n');
    }
  } else {
    for (result in results) {
      if (!results[result].results.score) {
        process.emit('log:error', [
          _.r_bg(' ✔ passmarked: '),
          results[result].address,
          'results not yet available'
        ]);
      } else if (results[result].results.score >= 90) {
        console.log(
          _.inv(' ✔ passmarked: '),
          results[result].address,
          _.g_bg(results[result].results.score)
        );
      } else if (results[result].results.score >= 75) {
        console.log(
          _.inv(' ✔ passmarked: '),
          results[result].address,
          _.y_bg(results[result].results.score)
        );
      } else {
        console.log(
          _.inv(' ✔ passmarked: '),
          results[result].address,
          _.r_bg(results[result].results.score)
        );
      }
    }
  }
};
