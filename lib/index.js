// required modules
var _ = require('lodash');

// extend out base module with the constants for the service
module.exports = exports = _.extend({}, {

  create:           require('./modules/create.report'),
  getReport:        require('./modules/get.report'),
  getReportStatus:  require('./modules/get.report.status'),
  getIssues:        require('./modules/get.issues'),
  getOccurrences:   require('./modules/get.occurrences'),
  getWebsites:      require('./modules/get.websites'),
  getProfile:       require('./modules/get.profile'),
  getBalance:       require('./modules/get.balance'),
  createTest:       require('./modules/test'),
  createPayload:    require('./models/payload'),
  createRunner:     require('./modules/run')

}, require('./constants'));
