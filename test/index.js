
'use strict';

var child_process = require('child_process');
var nock = require('nock');
var expect = require('chai').expect;

var fqdn = 'google.com';
var ipv4 = '104.18.38.200';
var ipv6 = '::0';

describe('passmarked', function() {

  this.timeout(10000); // we're testing over http ._.

  describe('index', function() {
    describe('domain address types', function() {
      it('should accept fqdn', function(done) {
        child_process.exec(
          __dirname + '/../index ' + fqdn,
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });
      it('should accept ipv4', function(done) {
        child_process.exec(
          __dirname + '/../index ' + ipv4,
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });
      it('should accept ipv6', function(done) {
        child_process.exec(
          __dirname + '/../index ' + ipv6,
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
            __dirname + '/../index ' + fqdn,
            function(err, stdout, stderr) {
              expect(err).to.not.be.okay;
              expect(stderr).to.not.be.okay;
              done();
            }
          );
        });

        it('should run without error if an ipv4 address is given', function(done) {
          child_process.exec(
            __dirname + '/../index ' + ipv4,
            function(err, stdout, stderr) {
              expect(err).to.not.be.okay;
              expect(stderr).to.not.be.okay;
              done();
            }
          );
        });

        it('should run without error if an ipv6 is given', function(done) {
          child_process.exec(
            __dirname + '/../index ' + ipv6,
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
            __dirname + '/../index -a ' + fqdn,
            function(err, stdout, stderr) {
              expect(err).to.not.be.okay;
              expect(stderr).to.not.be.okay;
              done();
            }
          );
        });

        it('should run without error if an ipv4 address is given', function(done) {
          child_process.exec(
            __dirname + '/../index -a ' + ipv4,
            function(err, stdout, stderr) {
              expect(err).to.not.be.okay;
              expect(stderr).to.not.be.okay;
              done();
            }
          );
        });

        it('should run without error if an ipv6 is given', function(done) {
          child_process.exec(
            __dirname + '/../index -a ' + ipv6,
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
            __dirname + '/../index -j ' + fqdn,
            function(err, stdout, stderr) {
              expect(err).to.not.be.okay;
              expect(stderr).to.not.be.okay;
              done();
            }
          );
        });

        it('should run without error if an ipv4 address is given', function(done) {
          child_process.exec(
            __dirname + '/../index -j ' + ipv4,
            function(err, stdout, stderr) {
              expect(err).to.not.be.okay;
              expect(stderr).to.not.be.okay;
              done();
            }
          );
        });

        it('should run without error if an ipv6 is given', function(done) {
          child_process.exec(
            __dirname + '/../index -j ' + ipv6,
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
            __dirname + '/../index --address=' + fqdn + ' ' + fqdn,
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
        child_process.exec(
          'echo "google.com" | ' + __dirname + '/../index',
          function(err, stdout, stderr) {
            expect(err).to.not.be.okay;
            expect(stderr).to.not.be.okay;
            done();
          }
        );
      });

    });

  });

  describe.only('lib/stdin', function() {
    it('should display a warning if nothing is written to stdin after two seconds', function(done) {
      var node = child_process.exec(
        'node -e "require(\'./lib/stdin\').read(function() {});"',
        function(err, stdout, stderr) {
          expect(stderr.toString()).to.contain('expecting data on STDIN');
          done();
        }
      );
      setTimeout(node.kill.bind(node, 'SIGTERM'), 2500);
    });
  });

  describe('lib/passmarked', function() {
    var passmarked = require('../lib/passmarked');

    describe('#query', function() {
      it('should respond with an object containing results', function() {
        var mock = nock('http://api.passmarked.com')
          .get('/query')
          .query({domain: /.*/g})
          .reply(200, {
            score: 100,
            count: 100
          });

        passmarked.query('abc123', function(err, results) {
          expect(results).to.have.keys(['address', 'results', 'when']);
          done();
        });
      });
    });
    describe('#stats', function() {
      it('should respond with an object containing results', function() {
        var mock = nock('http://api.passmarked.com')
          .get('/stats').reply(200, {status: 'ok'});

        passmarked.stats(function(err, stats) {
          expect(results).to.have.keys(['status']);
          done();
        });
      });
    });
    describe('#submit', function() {
      it('should respond with an object containing an identifier', function() {
        var mock = nock('http://api.passmarked.com', {
          reqheaders: {'Content-Type': 'x-www-form-urlencoded'}
        }).post('/submit').reply(200, {id: 12345});

        passmarked.submit('abc123', function(err, submission) {
          expect(submission).to.have.keys(['id']);
          done();
        });
      });
    });
  });
});
