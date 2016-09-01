// pull in a few packages
var os          = require('os');
var osHomedir   = require('os-homedir');
var pkg         = require('../package.json');

// expose our constants
module.exports = exports = {

  TIMEOUT:            20, // timeout of connections in seconds
  WEB_URL:            'http://passmarked.com',
  BETA_WEB_URL:       'https://beta.passmarked.com',
  DATA_URL:           'http://data.passmarked.com',
  API_URL:            'https://api.passmarked.com',
  WSS_URL:            'ws://wss.passmarked.com/',
  VERSION:            pkg.version,
  SOURCE:             'passmarked.cli',
  APPNAME:            'passmarked.cli',
  USER_AGENT:         'Mozilla/5.0 (compatible; Passmarked-CLI/' + require('../package.json').version + '; +http://passmarked/docs/cli)',
  HOME_DIR:           osHomedir(),
  CONFIG_FILE:        osHomedir() + "/.passmarked.json",
  CATEGORIES:         [ 'comptibility', 'performance', 'content', 'security' ],
  CONFIG_VERSION:     'v1',
  LEVELS: {

    CRITICAL: 40,
    ERROR:    30,
    WARNING:  20,
    NOTICE:   10,
    ALL:      0

  },
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
