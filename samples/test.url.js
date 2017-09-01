var passmarked = require('../index.js');
// create and run a report, waiting for it to finish
var report = passmarked.create({

  url:     'http://example.com',
  token:   '<token>'

});
report.on('error', function(err) {

  console.error(err)

});
report.on('done', function(result) {

  var code = result.getResult();

  if(code == 'success') {

    console.log('done with a score of ' + result.getScore())

  } else {

    console.log('failed with the result of: ' + code)

  }
  
  process.exit(0)

});
report.start(function(err) {

  // started

});
