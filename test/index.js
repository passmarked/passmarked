
'use strict';

function exec(address, callback) {
  return ;
}

function spawn(pipe, callback) {
  return child_process.spawn(command);
}

var child_process = require('child_process');
var expect = require('chai').expect;

describe('index', function() {

  describe('domain address types', function() {

    it('should accept fqdn', function(done) {
      child_process.exec(
        (__dirname + '/index ' + address),
        function(err, stdout, stderr) {}
      );
    });
    it('should accept ipv4', function(done) {
      child_process.exec(
        (__dirname + '/index ' + address),
        function(err, stdout, stderr) {}
      );
    });
    it('should accept ipv6', function(done) {
      child_process.exec(
        (__dirname + '/index ' + address),
        function(err, stdout, stderr) {}
      );
    });

  });

  describe('argv', function() {

    describe('_', function() {

      it('should run without error if a fqdn is given', function(done) {
        child_process.exec(
          (__dirname + '/index example.com'),
          function(err, stdout, stderr) {}
        );
      });

      it('should run without error if an ipv4 address is given', function(done) {
        child_process.exec(
          (__dirname + '/index 8.8.8.8'),
          function(err, stdout, stderr) {}
        );
      });

      it('should run without error if an ipv6 is given', function(done) {
        child_process.exec(
          (__dirname + '/index ::0'),
          function(err, stdout, stderr) {}
        );
      });

    });

    describe('domain', function() {

      it('should run without error if a fqdn is given', function(done) {
        child_process.exec(
          (__dirname + '/index -d example.com'),
          function(err, stdout, stderr) {}
        );
      });

      it('should run without error if an ipv4 address is given', function(done) {
        child_process.exec(
          (__dirname + '/index -d 8.8.8.8'),
          function(err, stdout, stderr) {}
        );
      });

      it('should run without error if an ipv6 is given', function(done) {
        child_process.exec(
          (__dirname + '/index -d ::0'),
          function(err, stdout, stderr) {}
        );
      });

    });

    describe('json', function() {

      it('should run without error if a fqdn is given', function(done) {
        child_process.exec(
          (__dirname + '/index -j example.com'),
          function(err, stdout, stderr) {}
        );
      });

      it('should run without error if an ipv4 address is given', function(done) {
        child_process.exec(
          (__dirname + '/index -j 8.8.8.8'),
          function(err, stdout, stderr) {}
        );
      });

      it('should run without error if an ipv6 is given', function(done) {
        child_process.exec(
          (__dirname + '/index -j ::0'),
          function(err, stdout, stderr) {}
        );
      });

    });

    describe('_ and domain', function() {

      it('shouldn\'t explode', function(done) {

        child_process.exec(
          (__dirname + '/index --domain=example.com example.com'),
          function(err, stdout, stderr) {}
        );

      });

    });

  });

  describe('stdin', function() {

    it('should read from stdin', function(done) {
      var passmarked = child_process.spawn(
        __dirname + '/index -j'
      ).on('error', done);

      passmarked.stdout.on('data', function(data) {
        // check here that it received `example.com`
      });

      passmarked.stdin.end('example.com');
    });

  });

});
