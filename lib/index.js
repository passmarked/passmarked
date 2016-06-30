// required modules
var _ = require('lodash');

// extend out base module with the constants for the service
module.exports = exports = _.extend({}, {

  create:         require('./modules/create.report'),
  getReport:      require('./modules/get.report'),
  getWebsites:    require('./modules/get.websites'),
  getProfile:     require('./modules/get.profile'),
  getBalance:     require('./modules/get.balance'),
  createPayload:  require('./models/payload'),
  createRunner:   require('./modules/run')

}, require('./constants'));
