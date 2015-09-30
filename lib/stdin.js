
'use strict';

var args = require('./argv');
var _ = require('./colours');

module.exports = {
  read: function(done) {
    var warningTimer = setTimeout(function() {
      if (args.quiet) return;
      process.stderr.write(
        _.inv(' ✔ passmarked: ') +
        ' expecting data on STDIN. Exiting in ten seconds...\n'
      );
    }, 2000).unref();
    var autoCloseTimer = setTimeout(function() {
      process.stdin.end();
      process.exit(0);
    }, 10000).unref();
    var piped = '';
    process.stdin.on('data', function(data) {
      clearTimeout(warningTimer);
      clearTimeout(autoCloseTimer);
      piped += data;
    }).on('end', function() {
      done(piped.trim().split(args.delimiter));
    }).on('error', process.emit.bind(process, 'log:error', [
      _.r_bg(' ✔ passmarked: '), 'error while reading from STDIN'
    ])).setEncoding('utf8');
  }
};
