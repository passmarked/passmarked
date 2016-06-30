var passmarked = require('passmarked');
// create and run a report, waiting for it to finish
var report = passmarked.create({

  url:     'http://example.com',
  token:   '<token>'

});
report.on('issue', function(err, issue) {

  console.log('Found a issue - ' + issue.message);

});
report.on('done|end', function(err, data) {

  console.log('done with a score of ' + data.score)

});
report.on('progress', function(err, data) {

  console.log('done with a score of ' + data.score)

});
report.start(function(err) {

  console.log('Report started');

});
