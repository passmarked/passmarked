var passmarked = require('passmarked');
passmarked.getWebsites('<token>', function(err, websites) {

  // output information from call
  console.error(err);
  console.dir(websites);

});
