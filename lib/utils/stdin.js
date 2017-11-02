
'use strict';

const _ = require('underscore');

module.exports = {
  read: function(done) {

    // create a safe callback
    var callback = _.once(done);

    // show that we are waiting on content
    process.stderr.write('waiting on data from stdin ...\n', function() {

      var autoCloseTimer = setTimeout(function() {

        // close the buffer/stream and show that why closed
        console.log('no data received from stdin, closing ...');
        process.stdin.end();
        process.exit(0);

      }, 15000);

      var content = '';
      process.stdin.on('data', function(data) {

        process.stdin.end();
        clearTimeout(autoCloseTimer);

        content += data.toString();
        done(null, content);

      }).on('end', function() {
        callback(null, content);
      }).on('error', function(err){
        callback(err);
      }).setEncoding('utf8');

    });

  }
};
