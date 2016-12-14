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

      it('Should execute the bootstrap command when simply passed as option with custom logger', function(done) {

        var counter = 0;
        var booted = false;
        var logs = 0;

        var runner = passmarked.createRunner({

          logger:     {

            info: function() { logs++; },
            debug: function() { logs++; },
            error: function() { logs++; },
            warning: function() { logs++; }

          },
          bootstrap: function(logger, cb) {

            // log something
            logger.info('test!')

            // set to true
            booted = true;

            // done
            cb(null);

          }

        }, [

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
          if(logs <= 0) assert.fail('Custom logger did not work');
          if(booted == false) assert.fail('The bootstrap command has to be called')
          if(!rules) assert.fail('Returned rules must not be blank');
          if(counter != 1) assert.fail('Code was not execute for the module');

          // done
          done();

        });

      });

      it('Should execute the bootstrap command when simply passed as option', function(done) {

        var counter = 0;
        var booted = false;

        var runner = passmarked.createRunner({

          bootstrap: function(logger, cb) {

            // set to true
            booted = true;

            // done
            cb(null);

          }

        }, [

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
          if(booted == false) assert.fail('The bootstrap command has to be called')
          if(!rules) assert.fail('Returned rules must not be blank');
          if(counter != 1) assert.fail('Code was not execute for the module');

          // done
          done();

        });

      });

      it('Should execute the bootstrap command when created as object', function(done) {

        var counter = 0;
        var booted = false;

        var testParams = passmarked.createTest({

          rules:  [

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

          ]

        });

        testParams.bootstrap = function(logger, cb) {

          // set to true
          booted = true;

          // done
          cb(null);

        };

        var runner = passmarked.createRunner(testParams);
        runner.run({

          url: 'http://example.com'

        }, function(err, rules) {

          // should not have a error
          if(err) assert.fail('Was not expecting a error');
          if(booted == false) assert.fail('The bootstrap command has to be called')
          if(!rules) assert.fail('Returned rules must not be blank');
          if(counter != 1) assert.fail('Code was not execute for the module');

          // done
          done();

        });

      });

      it('Should run one function and return as a callback', function(done) {

        var counter = 0;

        var runner = passmarked.createRunner([

          function(payload, cb) {

            // should not be null/undefined object
            if(payload === null)
              assert.fail('Payload should not be null');
            if(payload === undefined)
              assert.fail('Payload should not be null');

            payload.addRule({

              key:      'test',
              message:  'The BIG TEST ...',
              type:     'error'

            }, {

              message:      'test, $, $ and $',
              display:      'code',
              identifiers:  [ 1,2,3 ],
              tools:        []

            });

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
