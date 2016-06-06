var _ = require('lodash');
var Module = _.extend({}, require('./constants'));

Module.createReport     = require('./modules/create.report');
Module.getReport        = require('./modules/get.report');
Module.getWebsites      = require('./modules/get.websites');
Module.getProfile       = require('./modules/get.profile');
Module.getBalance       = require('./modules/get.balance');

module.exports=exports=Module;
