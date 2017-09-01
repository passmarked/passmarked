var passmarked = require('../index.js');
passmarked.getOccurrences({

  key:  '20170901c6d4d9c021597P'

}, function(err, occurrences) {

  if(err) {

    console.log('something went wrong ... :(')

  } else if(occurrences.length == 0) {

    console.log('no occurrences for report');

  } else {

    console.log()
    console.log('occurrences with raw messages:')
    for(var i = 0; i < occurrences.length; i++) {

      console.log('-> ' + occurrences[i].getMessage())

    }

    console.log()
    console.log('--------')
    console.log()

    console.log('occurrences with formatted messages:')
    for(var i = 0; i < occurrences.length; i++) {

      console.log('-> ' + occurrences[i].getMessage(true))

    }

    console.log()
    console.log('--------')
    console.log()

    console.log('Get the display types:')
    for(var i = 0; i < occurrences.length; i++) {

      if(occurrences[i].getDisplay() === 'code') {

        console.log('-> show code:', occurrences[i].getCode());

      } else if(occurrences[i].getDisplay() === 'url') {

        console.log('-> show url:', occurrences[i].getURL())

      } else if(occurrences[i].getDisplay() === 'chain') {

        console.log('-> show ssl chain:', occurrences[i].getSSLChain())

      } else {

        console.log('-> nothing to show, just show text');

      }

    }

  }

});