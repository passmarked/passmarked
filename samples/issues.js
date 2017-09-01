var passmarked = require('../index.js');
passmarked.getIssues({

  key:  '20170901c6d4d9c021597P'

}, function(err, issues) {

  if(err) {

    console.log('something went wrong ... :(')

  } else if(issues.length == 0) {

    console.log('no issues for report');

  } else {

    for(var i = 0; i < issues.length; i++) {

      console.log('-> ' + issues[i].getMessage())

    }

  }

});