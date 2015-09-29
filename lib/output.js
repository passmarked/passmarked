
'use strict';

var _ = require('./colours');
var args = require('./argv');

module.exports = function(err, res) {
  if (!res.results.score) {
    // TODO
    // submit the site?
    process.emit('log:error', [
      _.r_bg(' ✔ passmarked.com: '),
      'results not yet available'
    ]);
  } else if (args.output) {
    log.write(args.json ? (
      args.pretty ? JSON.stringify(res, null, '\t') : JSON.stringify(res)
    ) : res.address + ': ' + res.results.score + '\n');
  } else if (args.json) {
    console.log(args.pretty ? JSON.stringify(res, null, '\t') : JSON.stringify(res));
  } else if (res.results.score >= 90) {
    console.log(
      _.inv(' ✔ passmarked-cli: '),
      res.address,
      _.g_bg(res.results.score)
    );
  } else if (res.results.score >= 75) {
    console.log(
      _.inv(' ✔ passmarked-cli: '),
      res.address,
      _.y_bg(res.results.score)
    );
  } else {
    console.log(
      _.inv(' ✔ passmarked-cli: '),
      res.address,
      _.r_bg(res.results.score)
    );
  }
};
