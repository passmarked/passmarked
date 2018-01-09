'use strict';

var child_process = require('child_process');
var nock = require('nock');
var expect = require('chai').expect;
var assert = require('chai').assert;
var passmarked = require('../lib/index');
var assert = require('assert');

describe('passmarked', function() {

  describe('#create', function() {

    describe('#start', function() {

      /* it('Should not fail when trying to start with valid domain [passmarked.com]', function(done) {

        var report = passmarked.create({ url: 'http://passmarked.com' });
        report.start(function(err){

          if(err) assert.fail('Was not expecting a error');
          done();

        });

      }); */

      it('Patterns should be set to [], in default', function(done) {

        var report = passmarked.create({});
        if(report.getPatterns() === null) {

          assert.fail('Patterns returned was null');

        }
        if(report.getPatterns() === undefined) {

          assert.fail('Patterns returned was undefined');

        }
        if(report.getPatterns().length != 0) {

          assert.fail('Paterns should be blank array by default');

        }
        done();

      });

      it('Limit should be set to null, in default', function(done) {

        var report = passmarked.create({});
        if(report.getLimit() !== null) {

          assert.fail('Limit returned did not match');

        }
        done();

      });

      it('Token should be set to null, in default', function(done) {

        var report = passmarked.create({});
        if(report.getToken() !== null) {

          assert.fail('Token returned did not match');

        }
        done();

      });

      it('Recursive should be set to true if set', function(done) {

        var report = passmarked.create({ recursive: true });
        if(report.isRecursive() !== true) {

          assert.fail('Returned recursive returned did not match');

        }
        done();

      });

      it('Recursive should be set to false, in default', function(done) {

        var report = passmarked.create({});
        if(report.isRecursive() !== false) {

          assert.fail('Return recursive should be false');

        }
        done();

      });

      it('Bail should be set to false, in default', function(done) {

        var report = passmarked.create({});
        if(report.isBail() !== false) {

          assert.fail('Token returned did not match');

        }
        done();

      });

      it('Should return the bail we passed in', function(done) {

        var report = passmarked.create({ bail: true });
        if(report.isBail() === false) {

          assert.fail('Token returned did not match');

        }
        done();

      });

      it('Should return the token we passed in', function(done) {

        var report = passmarked.create({ token: 'test' });
        if(report.getToken() != 'test') {

          assert.fail('Token returned did not match');

        }
        done();

      });

      it('Should throw a error if no callback was given', function(done) {

        var report = passmarked.create({ token: 'test' });
        try {
          report.start();
          assert.fail('Was expecting a error ...');
        } catch(err) {}

        done();

      });

      it('Should return a error if recursive requested and no token given', function(done) {

        var report = passmarked.create({ recursive: true });
        report.start(function(err, data) {

          // we should get a error ?
          if(!err) {

            // fail then
            assert.fail('Did not receive a error');

          }

          // done
          done();

        });

      });

    });

  });

});
