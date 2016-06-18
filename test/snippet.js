// modules
const assert      = require('assert');
const _           = require('lodash');
const fs          = require('fs');

// run the rules
Snippets          = require('../lib/utils/snippet')

describe('Snippets', function() {

  // test array
  var stubLines = [

    '<h1>',
    '<h2>',
    '<h3>',
    '<h4>',
    '<h5>',
    '<h6>'

  ]

  describe('#getStart', function() {

    // handle the error output
    it('should return 0 if context is more than what is available', function(done) {
      assert(Snippets.getStart(10, 2, 3) == 0, 'expected start to be 0')
      done()
    });

    // handle the error output
    it('should return > 0 if context is less than what is available', function(done) {
      assert(Snippets.getStart(10, 5, 3) != 0, 'expected start to be 0')
      done()
    });

  });

  // handle each function
  describe('#getEnd', function() {

    // handle the error output
    it('should return the last line if context is more than what is available', function(done) {
      assert(Snippets.getEnd(10, 10, 3) == 10, 'expected start to be on the last line')
      done()
    });

    // handle the error output
    it('should not return the last line if context is less than what is available', function(done) {
      assert(Snippets.getEnd(10, 5, 3) != 10, 'expected start not to be 10')
      done()
    });

  });

  // handle each function
  describe('#slice', function() {

    // handle the error output
    it('should return a blank array if there was a problem', function(done) {
      assert(Snippets.slice([], 10, 10).length == 0, 'expected a blank array')
      done()
    });

    // handle the error output
    it('should return <h4> if lines 3 and 4 are given', function(done) {
      var output_code_strs = Snippets.slice(stubLines, 3, 4)
      assert(output_code_strs.indexOf('<h4>') == 0, 'expected <h4>')
      done()
    });

    // handle the error output
    it('should return <h4>,<h5> if lines 3 and 5 are given', function(done) {
      var output_code_strs = Snippets.slice(stubLines, 3, 5)
      assert(output_code_strs.indexOf('<h4>') == 0, 'expected <h4>')
      assert(output_code_strs.indexOf('<h5>') == 1, 'expected <h5>')
      done()
    });

  });

});

