
'use strict';

var validate = require('./validate');
var passmarked = require('./passmarked');

module.exports = function(addresses) {
  if (!Array.isArray(addresses)) addresses = [addresses];
  for (var address in addresses) {
    validate(addresses[address], function(err) {
      if (err) return;
      passmarked.query(addresses[address], function(err, res) {
        if (!err) process.emit('log:result', res);
      });
    });
  }
};
