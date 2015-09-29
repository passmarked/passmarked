
'use strict';

var child_process = require('child_process');
var expect = require('chai').expect;

var fqdn = 'google.com';
var ipv4 = '104.18.38.200';

describe('index', function() {

  describe('domain address types', function() {

    it('should accept fqdn', function(done) {
      child_process.exec(
        __dirname + '/index ' + fqdn,
        function(err, stdout, stderr) {
          expect(err).to.not.be.okay;
          expect(stderr).to.not.be.okay;
          done();
        }
      );
    });
    it('should accept ipv4', function(done) {
      child_process.exec(
        __dirname + '/index ' + ipv4,
        function(err, stdout, stderr) {
          expect(err).to.not.be.okay;
          expect(stderr).to.not.be.okay;
          done();
        }
      );
    });
    it('should accept ipv6', function(done) {
      child_process.exec(
        __dirname + '/index ::0',
        function(err, stdout, stderr) {
          expect(err).to.not.be.okay;
          expect(stderr).to.not.be.okay;
          done();
        }
      );
    });

  });

  describe('argv', function() {

    describe('_', function() {

      it('should run without error if a fqdn is given', function(done) {
        child_process.exec(
          __dirname + '/index ' + fqdn,
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

      it('should run without error if an ipv4 address is given', function(done) {
        child_process.exec(
          __dirname + '/index ' + ipv4,
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

      it('should run without error if an ipv6 is given', function(done) {
        child_process.exec(
          __dirname + '/index ::0',
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

    });

    describe('address', function() {

      it('should run without error if a fqdn is given', function(done) {
        child_process.exec(
          __dirname + '/index -a ' + fqdn,
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

      it('should run without error if an ipv4 address is given', function(done) {
        child_process.exec(
          __dirname + '/index -a ' + ipv4,
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

      it('should run without error if an ipv6 is given', function(done) {
        child_process.exec(
          __dirname + '/index -a ::0',
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

    });

    describe('json', function() {

      it('should run without error if a fqdn is given', function(done) {
        child_process.exec(
          __dirname + '/index -j ' + fqdn,
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

      it('should run without error if an ipv4 address is given', function(done) {
        child_process.exec(
          __dirname + '/index -j ' + ipv4,
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

      it('should run without error if an ipv6 is given', function(done) {
        child_process.exec(
          __dirname + '/index -j ::0',
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

    });

    describe('_ and domain', function() {

      it('shouldn\'t explode', function(done) {

        child_process.exec(
          __dirname + '/index --address=' + fqdn + ' ' + fqdn,
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );

      });

    });

  });

  describe('stdin', function() {

    it('should read from stdin', function(done) {
      var passmarked = child_process.spawn(
        __dirname + '/../index', ['-j']
      ).on('error', done);

      var out = '';
      passmarked.stdout.on('data', function(data) {
        out += data;
      }).on('end', function() {
        out = JSON.parse(out);
        expect(out[0]).to.have.keys(['address', 'results', 'when']);
        done();
      });

      passmarked.stdin.end(fqdn);
    });

  });

});
