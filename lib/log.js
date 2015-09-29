
'use strict';

var fs = require('fs');
var path = require('path');
var args = require('./argv');

module.exports = args.output ? fs.createWriteStream(
  path.resolve(args.output), {flags: 'a'}
) : false;
