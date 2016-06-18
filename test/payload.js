'use strict';

var child_process = require('child_process');
var nock = require('nock');
var expect = require('chai').expect;
var assert = require('chai').assert;
var validate = require('../lib/utils/validate');
var assert = require('assert');
var passmarked = require('../lib');

describe('passmarked', function() {

  describe('payload', function() {

    describe('#getPageContent', function() {

      it('Should return the given PageContent', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          url:      'http://example.com'

        }, {}, content);

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.getPageContent(function(err, returnedContent) {

          if(err)
            assert.fail('Got a error');

          if(returnedContent != content)
            assert.fail('Page Content was not returned as given');

          // done
          done();

        });

      });

      it('Should return the given PageContent', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {},
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.getPageContent(function(err, returnedContent) {

          if(err)
            assert.fail('Got a error');

          if(returnedContent != content)
            assert.fail('Page Content was not returned as given');

          // done
          done();

        });

      });

      it('Should return a error if the content was undefined', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {},
          body:     null,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.getPageContent(function(err, returnedContent) {

          if(!err)
            assert.fail('Was expecting a error for undefined content');

          // done
          done();

        });

      });

      /*** it('Should not return a error if content was just blank', function(done) {

        // get the content
        var content   = '';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {},
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.getPageContent(function(err, returnedContent) {

          if(err)
            assert.fail('Got a error');

          if(returnedContent != '')
            assert.fail('Page Content was not returned as given');

          // done
          done();

        });

      }); ***/

    });

    describe('#getHAR', function() {

      it('Should return the given HAR as a object when passed a object', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          url:      'http://example.com'

        }, { hello: 'world' }, content);

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.getHAR(function(err, har) {

          if(err)
            assert.fail('Got a error');

          if(!har)
            assert.fail('Returned HAR was empty');

          if(har.hello != 'world')
            assert.fail('Page Content was not returned as given');

          // done
          done();

        });

      });

      it('Should return the given HAR as a object when passed a object', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.getHAR(function(err, har) {

          if(err)
            assert.fail('Got a error');

          if(!har)
            assert.fail('Returned HAR was empty');

          if(har.hello != 'world')
            assert.fail('Page Content was not returned as given');

          // done
          done();

        });

      });

      it('Should return the given HAR as a object when passed a string', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      JSON.stringify({

            hello: 'world'

          }),
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.getHAR(function(err, har) {

          if(err)
            assert.fail('Got a error');

          if(!har)
            assert.fail('Returned HAR was empty');

          if(har.hello != 'world')
            assert.fail('Page Content was not returned as given');

          // done
          done();

        });

      });

      it('Should return the given HAR as a object when passed a string', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      JSON.stringify({

            hello: 'world'

          }),
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.getHAR(function(err, har) {

          if(err)
            assert.fail('Got a error');

          if(!har)
            assert.fail('Returned HAR was empty');

          if(har.hello != 'world')
            assert.fail('Page Content was not returned as given');

          // done
          done();

        });

      });

      it('Should return a error if HAR given was not valid', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      'all is one, one is all',
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.getHAR(function(err, har) {

          if(!err)
            assert.fail('Was expecting a error');

          if(har)
            assert.fail('Was not expecting a har');

          // done
          done();

        });

      });

    });

    describe('#getURL', function() {

      it('Should return the url as given', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');

        // check the items
        if(payload.getURL() != 'http://example.com')
          assert.fail('Should return the same url as passed');

        // done
        done();

      });

    });

    describe('#getURI', function() {

      it('Should return the hostname', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');

        // check the items
        if(payload.getURI().hostname != 'example.com')
          assert.fail('Hostname should match in the the parsed URL');

        // done
        done();

      });

      it('Should return the parsed URL', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');

        // check the items
        if(payload.getURL() != 'http://example.com')
          assert.fail('Should return the same url as passed');

        // done
        done();

      });

    });

    describe('#getStack', function() {

      it('Should return a blank array as the default', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');

        // get the stack
        var stack = payload.getStack();

        // check the items
        if(!stack)
          assert.fail('Default for stack should be defined');

        // check the items
        if(stack.length != 0)
          assert.fail('Stack should be a blank array');

        // done
        done();

      });

      it('Should return a blank array as the default', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com',
          stack:    ['test']

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');

        // get the stack
        var stack = payload.getStack();

        // check the items
        if(!stack)
          assert.fail('Default for stack should be defined');

        // check the items
        if(stack.length != 1)
          assert.fail('Stack should return 1, but got ' + stack.length);

        // done
        done();

      });

    });

    describe('#debug', function() {

      it('Should return 0 logs if none are given', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');

        // check the items
        if(payload.getLogs().length != 0)
          assert.fail('Default of logs should be 0');

        // done
        done();

      });

      it('Should return logs if debug is given', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.debug('TEST');

        // check the items
        if(payload.getLogs().length != 1)
          assert.fail('Was expecting logs of 1, but got ' + payload.getLogs().length);

        // done
        done();

      });

    });

    describe('#info', function() {

      it('Should return 0 logs if none are given', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');

        // check the items
        if(payload.getLogs().length != 0)
          assert.fail('Default of logs should be 0');

        // done
        done();

      });

      it('Should return logs if info is given', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.info('TEST');

        // check the items
        if(payload.getLogs().length != 1)
          assert.fail('Was expecting logs of 1, but got ' + payload.getLogs().length);

        // done
        done();

      });

    });

    describe('#warning', function() {

      it('Should return 0 logs if none are given', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');

        // check the items
        if(payload.getLogs().length != 0)
          assert.fail('Default of logs should be 0');

        // done
        done();

      });

      it('Should return logs if warning is given', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.warning('TEST');

        // check the items
        if(payload.getLogs().length != 1)
          assert.fail('Was expecting logs of 1, but got ' + payload.getLogs().length);

        // done
        done();

      });

    });

    describe('#error', function() {

      it('Should return 0 logs if none are given', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');

        // check the items
        if(payload.getLogs().length != 0)
          assert.fail('Default of logs should be 0');

        // done
        done();

      });

      it('Should return logs if error is given', function(done) {

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     '<p>test</p>',
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.error('TEST');

        // check the items
        if(payload.getLogs().length != 1)
          assert.fail('Was expecting logs of 1, but got ' + payload.getLogs().length);

        // done
        done();

      });

    });

    describe('#addRule', function() {

      it('Should add one rule as given', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.addRule({

          type: 'error',
          message: 'test',
          key: 'test'

        });

        // get the rules
        var rules = payload.getRules();

        // check the items
        if(rules.length == 0)
          assert.fail('No rules are given');

        // done
        done();

      });

      it('Should return 2 rules if unique keys are given', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.addRule({

          type: 'error',
          message: 'test',
          key: 'test'

        });
        payload.addRule({

          type: 'error',
          message: 'test',
          key: 'test2'

        });

        // get the rules
        var rules = payload.getRules();

        // check the items
        if(rules.length != 2)
          assert.fail('Was expecting 2 rules, but got ' + rules.length);

        // done
        done();

      });

      it('Should return one error with a count of 2', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.addRule({

          type: 'error',
          message: 'test',
          key: 'test'

        });
        payload.addRule({

          type: 'error',
          message: 'test',
          key: 'test'

        });

        // get the rules
        var rules = payload.getRules();

        // get the rule
        if(rules.length == 0)
          assert.fail('No rules are returned');

        // get the rule
        var rule = rules[0];

        // check if the count is 2
        if(rule.count != 2)
          assert.fail("Was expecting a count of two on the rule")

        // done
        done();

      });

      it('Should return 2 occurrences', function(done) {

        // get the content
        var content   = '<p>test</p>';

        // create the payload
        var payload   = passmarked.createPayload({

          har:      {

            hello: 'world'

          },
          body:     content,
          url:      'http://example.com'

        });

        // check if we got the content
        if(!payload) assert.fail('Payload was blank');
        payload.addRule({

          type: 'error',
          message: 'test',
          key: 'test'

        }, {

          message: 'test',
          identifiers: []

        });
        payload.addRule({

          type: 'error',
          message: 'test',
          key: 'test'

        }, {

          message: 'test',
          identifiers: []

        });
        payload.addRule({

          type: 'error',
          message: 'test',
          key: 'test'

        }, {

          message: 'test',
          identifiers: []

        });

        // get the rules
        var rules = payload.getRules();

        // get the rule
        if(rules.length == 0)
          assert.fail('No rules are returned');

        // get the rule
        var rule = rules[0];

        // check if the count is 2
        if(rule.count != 3)
          assert.fail("Was expecting a count of two on the rule");

        // check if the count is 2
        if(rule.occurrences.length != 3)
          assert.fail("Was expecting 3 occurrences")

        // done
        done();

      });

    });

  });

});
