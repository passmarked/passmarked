// pull in a few packages
var os          = require('os');
var osHomedir   = require('os-homedir');
var pkg         = require('../package.json');

// expose our constants
module.exports = exports = {

  TIMEOUT:            20, // timeout of connections in seconds
  WEB_URL:            'http://passmarked.com',
  DATA_URL:           'http://data.passmarked.com',
  API_URL:            'https://api.passmarked.com',
  WSS_URL:            'ws://wss.passmarked.com/',
  VERSION:            pkg.version,
  USER_AGENT:         'Mozilla/5.0 (compatible; Passmarked-CLI/' + require('../package.json').version + '; +http://passmarked/docs/cli)',
  HOME_DIR:           osHomedir(),
  CONFIG_FILE:        osHomedir() + "/.passmarked.json",
  CONFIG_VERSION:     'v1',
  BASIC_CONFIG: {

    version: pkg.version,
    installed: new Date().getTime(),
    token: null,
    structure: 'v1'

  },
  STATUS: {

    SUCCESS: 10

  },
  RESULTS: {

    SUCCESS: 10

  }

}
