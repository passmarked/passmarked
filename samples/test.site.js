var passmarked = require('passmarked');
var report = passmarked.create({

  url:         'http://example.com',
  token:       '<token>',
  recursive:   true,
  limit:       50,
  bail:        true,
  patterns:    [  ]

});
report.on('done|end', function(err, crawl) {

  console.log('done with a score of ' + crawl.score + ' after going through ' + crawl.pages + ' pages');

});
report.on('page', function(err, page) {

  console.log('Processed page - ' + page.url + ' score ' + page.score);

});
report.on('issue', function(err, issue) {

  console.log('Found a issue - ' + issue.message);

});
report.on('progress', function(err, crawl) {

  console.log('pages ' + crawl.processed + '/' + crawl.pages);

});
report.start(function(err, crawl) {

  console.log('crawl started');

});
