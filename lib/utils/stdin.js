
'use strict';

module.exports = {
  read: function(done) {
    var autoCloseTimer = setTimeout(function() {
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
      // done(null, content);
    }).on('error', function(err){
      // done(err);
    }).setEncoding('utf8');
  }
};
