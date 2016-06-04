// pull in our required modules
const blessed       = require('blessed');
const _             = require('lodash');

/**
* Actual Widget class to return
**/
var Widget = _.extend({}, require('./base'));

/**
* Sets up our events
**/
Widget.setupHandlers = function() {

  this.getChannel().subscribe('');
  this.getChannel().on('open', _.bind(function(){

    this.getElement().hidden = true;
    this.getScreen().render();

  }, this));
  this.getChannel().on('close', _.bind(function(){

    this.getElement().hidden = false;
    this.getScreen().render();

  }, this));

};

/**
* Builds the element if not already built
**/
Widget.renderElement = function(screen) {

  return blessed.box({

    top: 'center',
    left: 'center',
    width: '50%',
    height: '20%',
    align: 'center',
    valign: 'middle',
    content: 'Connecting to Passmarked Socket Server',
    tags: true,
    hidden: false,
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: '#f0f0f0'
      }
    }

  });

};

/**
* Expose the widget
**/
module.exports = exports = Widget
