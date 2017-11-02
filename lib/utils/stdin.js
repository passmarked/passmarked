
'use strict';

const _ = require('lodash');

module.exports = {
  read: function(done) {

    // create a safe callback
    var callback = _.once(done);

    var autoCloseTimer = setTimeout(function() {

      // close the buffer/stream and show that why closed
      console.log('no data received from stdin, closing ...\n');
      process.exit(0);

    }, 5 * 1000);

    var writeIntro = setTimeout(function() {

      // close the buffer/stream and show that why closed
      // show that we are waiting on content
      process.stderr.write('waiting on data from stdin ...\n', function() {
      });

    }, 1 * 1000);

    var content = '';
    process.stdin.on('data', function(data) {

      if(writeIntro) clearTimeout(writeIntro);

      if(process.stdin && 
          process.stdin.end) 
            process.stdin.end();
      clearTimeout(autoCloseTimer);

      content += data.toString();
      done(null, content);

    }).on('end', function() {
      // callback(null, content);
    }).on('error', function(err){
      // callback(err);
    }).setEncoding('utf8');

  }
};
