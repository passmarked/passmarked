// required modules
var _ = require('lodash');

// extend out base module with the constants for the service
module.exports = exports = _.extend({}, {

  createReport:   require('./modules/create.report'),
  getReport:      require('./modules/get.report'),
  getWebsites:    require('./modules/get.websites'),
  getProfile:     require('./modules/get.profile'),
  getBalance:     require('./modules/get.balance'),
  create:         require('./modules/run')

}, require('./constants'));
