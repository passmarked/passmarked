var passmarked = require('../index.js');
// create and run a report, waiting for it to finish
var report = passmarked.create({

  url:     'http://example.com',
  token:   '<token>'

});
report.on('issue', function(err, issue) {

  console.log('Found a issue - ' + issue.message);

});
report.on('done', function(err, data) {

  var result = report.getResult();
  console.log('done with a score of ' + result.getScore())
  process.exit(0)

});
report.on('progress', function(err) {

  var result = report.getResult();
  console.log('status ' + result.status)

});
report.start(function(err) {

  console.log('Report started');

});
