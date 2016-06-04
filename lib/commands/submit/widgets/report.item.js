// pull in our required modules
const blessed       = require('blessed');

module.exports = exports = blessed.box({

  top: 'center',
  left: 'center',
  width: '50%',
  height: '20%',
  align: 'center',
  valign: 'middle',
  content: 'Connecting to Passmarked Socket Server',
  tags: true,
  hidden: true,
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: '#f0f0f0'
    }
  }

});
