// pull in our required modules
const blessed       = require('blessed');

/**
* Actual Widget class to return
**/
var Widget = {};

/**
* Local channel variable we can use to listen for events
**/
Widget.channel = null;

/**
* Local instance of the element this widget renders
**/
Widget.element = null;

/**
* Local instance of the screen
**/
Widget.screen = null;

/**
* Returns the current screen
**/
Widget.getScreen = function() { return this.screen; };

/**
* Returns the current element
**/
Widget.getElement = function() { return this.element; };

/**
* Returns the event channel
**/
Widget.getChannel = function() { return this.channel; };

/**
* Sets the local channel variable we can use
* to monitor updates to our report
**/
Widget.setChannel = function(channel) {

  // set to our channel
  this.channel = channel;

  // setup our handlers
  this.setupHandlers();

};

/**
* Sets up our events
**/
Widget.setupHandlers = function() {};

/**
* default view
**/
Widget.renderElement = function() {

  return blessed.box({

    top: 'center',
    left: 'center',
    width: '50%',
    height: '20%',
    align: 'center',
    valign: 'middle',
    content: 'BASE VIEW',
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

};

/**
* Builds the element if not already built
**/
Widget.render = function(screen) {

  // set the screen
  this.screen = screen;

  // check if already defined
  if(this.element) return this.element;

  // set the element of the widget
  this.element = this.renderElement();

  // return it
  return this.element;

};

/**
* Expose the widget
**/
module.exports = exports = Widget
