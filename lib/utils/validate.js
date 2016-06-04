
'use strict';

var _ = require('./colours');
var validator = require('validator');

module.exports = function(input, done) {
  if (validator.isURL(input) ||
      validator.isIP(input) ||
      validator.isFQDN(input)) {
    return done(null, input);
  }
  process.emit('log:error', [
    _.r_bg(' ✔ passmarked: '),
    'please enter either an IP address or a fully-qualified domain name.'
  ]);
  done(true);
};
