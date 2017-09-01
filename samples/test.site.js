var passmarked = require('passmarked');
var report = passmarked.create({

  url:         'http://example.com',
  token:       '<token>',
  recursive:   true,
  limit:       50,
  bail:        true,
  patterns:    [  ]

});
report.on('done', function(result) {

  var code = result.getResult();

  if(code == 'success') {

    console.log('done with a score of ' + result.getScore() + ' after going through ' + crawl.getPages() + ' pages')

  } else {

    console.log('failed with the result of: ' + code)

  }
  
  process.exit(0)

});
report.on('error', function(err) {

  console.error(err);

});
report.start(function(err, crawl) {

  // started

});
