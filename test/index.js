'use strict';

var child_process = require('child_process');
var nock = require('nock');
var expect = require('chai').expect;
var assert = require('assert');

describe('cli', function() {

  describe('payload', function() {

    describe('#parseFilter', function() {

      it('Should return no filters if blank string was given', function(done) {

        var payload = require('../lib/payload');
        var results = payload.parseFilter();
        if(results.length > 0) assert.fail('Should not return anything ...');
        done();

      });

      it('Should return 1 filter with only category populated', function(done) {

        var payload = require('../lib/payload');
        var results = payload.parseFilter('performance.*');
        if(results.length == 0) assert.fail('Expected a filter');

        if(results[0].category  != 'performance') assert.fail('Category should be performance');
        if(results[0].test      != '*') assert.fail('Test should be *');
        if(results[0].rule      != '*') assert.fail('Rule should be *');

        done();

      });

      it('Should return 1 filter with category and test populated', function(done) {

        var payload = require('../lib/payload');
        var results = payload.parseFilter('performance.css');
        if(results.length == 0) assert.fail('Expected a filter');

        if(results[0].category  != 'performance') assert.fail('Category should be performance');
        if(results[0].test      != 'css') assert.fail('Test should be css');
        if(results[0].rule      != '*') assert.fail('Rule should be *');

        done();

      });

      it('Should return 1 filter with category, test and rule populated', function(done) {

        var payload = require('../lib/payload');
        var results = payload.parseFilter('performance.css.helloworld');
        if(results.length == 0) assert.fail('Expected a filter');

        if(results[0].category  != 'performance') assert.fail('Category should be performance');
        if(results[0].test      != 'css') assert.fail('Test should be css');
        if(results[0].rule      != 'helloworld') assert.fail('Rule should be helloworld');

        done();

      });

      it('Should return 3 filters with specified inputs', function(done) {

        var payload = require('../lib/payload');
        var results = payload.parseFilter('performance.*,performance.css,performance.css.helloworld');
        if(results.length != 3) assert.fail('Expected 3 filters');

        if(results[0].category  != 'performance') assert.fail('Category should be performance');
        if(results[0].test      != '*') assert.fail('Test should be *');
        if(results[0].rule      != '*') assert.fail('Rule should be *');

        if(results[1].category  != 'performance') assert.fail('Category should be performance');
        if(results[1].test      != 'css') assert.fail('Test should be css');
        if(results[1].rule      != '*') assert.fail('Rule should be *');

        if(results[2].category  != 'performance') assert.fail('Category should be performance');
        if(results[2].test      != 'css') assert.fail('Test should be css');
        if(results[2].rule      != 'helloworld') assert.fail('Rule should be helloworld');

        done();

      });

    });

  });

});
