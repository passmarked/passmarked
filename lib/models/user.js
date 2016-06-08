/**
* Pull in required modules
**/
const async         = require('async');
const url           = require('url');
const dns           = require('dns');
const _             = require('lodash');
const S             = require('string');

/**
* Expose our creation class that will be called
* with properties.
**/
module.exports = exports = function(params) {

  /**
  * The Report object to return that we can use
  **/
  var User = _.extend({}, require('./common')(params));

  /**
  * Returns the current url of the User
  **/
  User.getEmail = function() { return params.email; };

  /**
  * Returns the ID of the user
  **/
  User.getID = function() { return params.id; };

  /**
  * Returns the name of the user
  **/
  User.getName = function() { return params.name; };

  /**
  * Returns the providers (linked accounts of the user)
  **/
  User.getProviders = function() { return params.providers || []; };

  /**
  * Returns if this use is a admin
  **/
  User.isAdmin = function() { return params.admin === true; };

  /**
  * Returns the last time this user's profile was updated
  **/
  User.getLastUpdated = function() { return params.lastupdated; };

  /**
  * Returns when the user was created
  **/
  User.getCreated = function() { return params.created; };

  /**
  * Returns the last time the user logged in
  **/
  User.getLastLogin = function() { return params.lastlogin; };

  // return the User object to use
  return User;

};
