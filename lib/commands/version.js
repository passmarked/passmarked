// pull in our required modules
const config        = require('../config');

// add the actual command logic
module.exports = exports = function(payload, fn) {

  // Output the passmarked module version
  payload.debug('Passmarked version requested');

  // set the actual content
  payload.setText(config.getVersion());
  payload.setJSON({ version: config.getVersion() });
  payload.setXML('<Response version="' + config.getVersion() + '"></Response>');

  // done
  fn(null);

};
