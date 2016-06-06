/**
* Handles connecting and communicating with our API's,
* this module wraps our Socket so we can replace it if
* needs be.
**/

/**
* Get our modules
**/
const _             = require('lodash');
const dns           = require('dns');
const url           = require('url');
const S             = require('string');

/**
* The object to expose
**/
Validate = {}

/**
* Returns TRUE or FALSE if this is a local ip
**/
Validate.isLocalIP = function(address, fn) {

  // devide the sections
  var ip        = (address || '').toLowerCase();
  var sections =  ip.split('.');

  // check for local host
  if(ip === 'localhost') return fn(null, true);
  if(ip === '127.0.0.1') return fn(null, true);
  if(ip === '::1') return fn(null, true);

  // if it starts with the class C ranges
  if(sections[0] === '192') return fn(null, true);
  if(sections[0] === '172') return fn(null, true);
  if(sections[0] === '10') return fn(null, true);

  // done
  fn(null, false);

};

/**
* Validate if IP
**/
Validate.isDomain   = function(targetUrl, fn) {

  // calback should be defined
  if(!fn) throw new Error('Was expecting a callback');

  // add the protocol
  if(S(targetUrl).isEmpty() === true) return fn(null, false);

  // try to resolve the domain
  dns.lookup(targetUrl, {}, function(err, address, family) {

    // did we get a error ?
    if(err && err.code != 'ENOTFOUND') {

      // what type of error ?
      return fn(err, false);

    }

    // did we get a error ?
    if(err) {

      // what type of error ?
      return fn(null, false);

    }

    // sanity check that we got a address ?
    if(!address) return fn(null, false);

    // awesome move on
    fn(null, true, address);

  });

};

/**
* Validate if IP
**/
Validate.isIP   = function(address, fn) {

  // calback should be defined
  if(!fn) throw new Error('Was expecting a callback');

  // get the string as addr
  var addr = (address || '').toLowerCase();

  // validate the ips
  var isIPv4 = addr.match(/[\d]+\.[\d]+\.[\d]+\.[\d]+/gi);
  var isIPv6 = addr.match(/(([a-zA-Z0-9]{1,4}|):){1,7}([a-zA-Z0-9]{1,4}|:)/gi);

  // must be either a ip or a
  fn(null, isIPv4 === true || isIPv6 === true);

};

/**
* Expose the Validate
**/
module.exports = exports = Validate;
