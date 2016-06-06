var passmarked = require('passmarked');
passmarked.getProfile('<token>', function(err, profile) {

  // output information from call
  console.error(err);
  console.dir(profile);

});
