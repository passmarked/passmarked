
'use strict';

var http = require('http');
var _ = require('./colours');

module.exports = {
  query: function(address, done) {
    http.get('http://api.passmarked.com/query?domain=' + address, function(res) {
      var json = '';
      res.on('data', function(data) {
        json += data;
      }).on('end', function() {
        return done(null, {
          address: address,
          results: JSON.parse(json),
          when: Date.now()
        });
      });
    }).on('error', function(err) {
      process.emit('log:error', [
        _.r_bg(' ✔ api.passmarked.com: '),
        'host unreachable'
      ]);
      done(err);
    });
  },
  submit: function(address, done) {
    http.request({
      hostname: 'api.passmarked.com',
      method: 'POST', // ???
      path: '/submit', // ???
      headers: {} // ???
    }, function(res) {
      var json = '';
      res.on('data', function(data) {
        json += data;
      }).on('end', function() {
        done(null, JSON.parse(json));
      });
    }).on('error', function(err) {
      done(err);
    }).end(/* ??? */);
  }
};
