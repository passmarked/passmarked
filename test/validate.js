'use strict';

var child_process = require('child_process');
var nock = require('nock');
var expect = require('chai').expect;
var assert = require('chai').assert;
var validate = require('../lib/utils/validate');
var assert = require('assert');

describe('passmarked', function() {

  describe('validate', function() {

    describe('#isDomain', function() {

      it('Should return false if not a valid domain [test]', function(done) {

        validate.isDomain('test', function(err, result, ip) {

          if(err) assert.fail('Error was given');
          if(result === true) assert.fail('The IP should be false');
          if(ip !== null && ip !== undefined) assert.fail('IP returned should be null');
          done();

        });

      });

      it('Should return false if not a valid domain [passmarked2.com]', function(done) {

        validate.isDomain('passmarked2.com', function(err, result, ip) {

          if(err) assert.fail('Error was given');
          if(result === true) assert.fail('The IP should be false');
          if(ip !== null && ip !== undefined) assert.fail('IP returned should be null');
          done();

        });

      });

      it('Should return false if not a valid domain [blank]', function(done) {

        validate.isDomain('', function(err, result, ip) {

          if(err) assert.fail('Error was given');
          if(result === true) assert.fail('The IP should be false');
          if(ip !== null && ip !== undefined) assert.fail('IP returned should be null');
          done();

        });

      });

      it('Should return true if a valid domain [passmarked.com]', function(done) {

        validate.isDomain('passmarked.com', function(err, result, ip) {

          if(err) assert.fail('Error was given');
          if(result === false) assert.fail('The result should be true');
          if(ip === null || ip === undefined) assert.fail('IP returned should not be null');
          done();

        });

      });

    });

    describe('#isLocalIP', function() {

      it('Should return false if localhost', function(done) {

        validate.isLocalIP('localhost', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === false) assert.fail('The IP should be true');
          done();

        });

      });

      it('Should return false if 127.0.0.1', function(done) {

        validate.isLocalIP('127.0.0.1', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === false) assert.fail('The IP should be true');
          done();

        });

      });

      it('Should return false if ::1', function(done) {

        validate.isLocalIP('::1', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === false) assert.fail('The IP should be true');
          done();

        });

      });

      it('Should return false if 192.168.0.1', function(done) {

        validate.isLocalIP('192.168.0.1', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === false) assert.fail('The IP should be true');
          done();

        });

      });

      it('Should return false if 172.168.1.1', function(done) {

        validate.isLocalIP('172.168.1.1', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === false) assert.fail('The IP should be true');
          done();

        });

      });

      it('Should return false if 10.0.0.1', function(done) {

        validate.isLocalIP('10.0.0.1', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === false) assert.fail('The IP should be true');
          done();

        });

      });

      it('Should return false if 104.155.108.198', function(done) {

        validate.isLocalIP('104.155.108.198', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === true) assert.fail('The IP should be false as it is a external server');
          done();

        });

      });

    });

    describe('#isIP', function() {

      it('Should return false if not a valid IPV4 and IPV6', function(done) {

        validate.isIP(null, function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === true) assert.fail('The IP should be false');
          done();

        });

      });

      it('Should return false if address is not valid IPv4 [192]', function(done) {

        validate.isIP('192', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === true) assert.fail('The IP should be false');
          done();

        });

      });

      it('Should return false if address is not valid IPv4 [192.168.0.]', function(done) {

        validate.isIP('192.168.0.', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === true) assert.fail('The IP should be false');
          done();

        });

      });

      it('Should return true if a valid IPV4', function(done) {

        validate.isIP('192.168.0.1', function(err, result) {

          if(err) assert.fail('Error was given');
          if(result === true) assert.fail('The IP should be false');
          done();

        });

      });

    });

  });

});
