// pull in a few packages
var os          = require('os');
var pkg         = require('../package.json');

// expose our constants
module.exports = exports = {

  WEB_URL: 'http://passmarked.com',
  DATA_URL: 'http://data.passmarked.com',
  API_URL: 'https://api.passmarked.com',
  USER_AGENT: 'Mozilla/5.0 (compatible; Passmarked-CLI/' + require('../package.json').version + '; +http://passmarked/docs/cli)',
  HOME_DIR: os.homedir(),
  CONFIG_FILE: os.homedir() + "/.passmarked.json",
  CONFIG_VERSION: 'v1',
  BASIC_CONFIG: {

    version: pkg.version,
    installed: new Date().getTime(),
    token: null,
    structure: 'v1'

  }

}
