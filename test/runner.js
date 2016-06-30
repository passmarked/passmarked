'use strict';

var child_process = require('child_process');
var nock = require('nock');
var expect = require('chai').expect;
var assert = require('chai').assert;
var validate = require('../lib/utils/validate');
var assert = require('assert');
var passmarked = require('../lib');

describe('passmarked', function() {

  describe('runner', function() {

    describe('#createRunner', function() {

      it('Should run one function and return as a callback', function(done) {

        var counter = 0;

        var runner = passmarked.createRunner([

          function(payload, cb) {

            // should not be null/undefined object
            if(payload === null)
              assert.fail('Payload should not be null');
            if(payload === undefined)
              assert.fail('Payload should not be null');

            // count up one
            counter++;

            cb();

          }

        ]);
        runner.run({

          url: 'http://example.com'

        }, function(err, rules) {

          // should not have a error
          if(err) assert.fail('Was not expecting a error');
          if(!rules) assert.fail('Returned rules must not be blank');
          if(counter != 1) assert.fail('Code was not execute for the module');

          // done
          done();

        });

      });

      it('Should run multiple functions and return as a callback', function(done) {

        var counter = 0;

        var runner = passmarked.createRunner([

          function(payload, cb) {

            // should not be null/undefined object
            if(payload === null)
              assert.fail('Payload should not be null');
            if(payload === undefined)
              assert.fail('Payload should not be null');

            // count up one
            counter++;

            cb();

          }

        ]);
        runner.run({

          url: 'http://example.com'

        }, function(err, rules) {

          // should not have a error
          if(err) assert.fail('Was not expecting a error');
          if(!rules) assert.fail('Returned rules must not be blank');
          if(counter != 1) assert.fail('Code was not execute for the module');

          // done
          done();

        });

      });

      it('Should run one function and return as a promise', function(done) {

        var counter = 0;

        var runner = passmarked.createRunner([

          function(payload, cb) {

            // should not be null/undefined object
            if(payload === null)
              assert.fail('Payload should not be null');
            if(payload === undefined)
              assert.fail('Payload should not be null');

            // count up one
            counter++;

            cb();

          }

        ]);
        runner.run({

          url: 'http://example.com'

        }).then(function(rules) {

          if(!rules) assert.fail('Returned rules must not be blank');
          if(counter != 1) assert.fail('Code was not execute for the module');
          done();

        }).catch(function(err) {

          if(err) assert.fail('Was not expecting a error');
          done();

        });

      });


      it('Should run multiple functions and return as a promise', function(done) {

        var counter = 0;

        var runner = passmarked.createRunner([

          function(payload, cb) {

            // should not be null/undefined object
            if(payload === null)
              assert.fail('Payload should not be null');
            if(payload === undefined)
              assert.fail('Payload should not be null');

            // count up one
            counter++;

            cb();

          },

          function(payload, cb) {

            // should not be null/undefined object
            if(payload === null)
              assert.fail('Payload should not be null');
            if(payload === undefined)
              assert.fail('Payload should not be null');

            // count up one
            counter++;

            cb();

          }

        ]);
        runner.run({

          url: 'http://example.com'

        }).then(function(rules) {

          if(!rules) assert.fail('Returned rules must not be blank');
          if(counter != 2) assert.fail('Code was not execute for the module');
          done();

        }).catch(function(err) {

          if(err) assert.fail('Was not expecting a error');
          done();

        });

      });

    });

  });

});
