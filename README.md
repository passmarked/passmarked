
# Passmarked

![NPM](https://img.shields.io/npm/dt/passmarked.svg) [![Build Status](https://travis-ci.org/passmarked/passmarked.svg)](https://travis-ci.org/passmarked/passmarked)

CLI/Module/Framework the [Passmarked](https://passmarked.com) API that can be used for easy integrations and general horse play. Intended to be usable as a simple tool for your development workflow but also usable on services like Jenkins with a API to integrate into your own code. Providing a framework the package also allows any system to run any of the open source [Passmarked](https://passmarked.com) rules directly from your system.

## Install

### NPM

```
npm install -g passmarked
```

View the project at [npmjs.com/package/passmarked](https://www.npmjs.com/package/passmarked).

### From Source

To build from source:

```bash
git clone git@github.com:passmarked/passmarked.git passmarked/
cd passmarked/
npm install
```

Then you are able to execute the utility using:

```
./index --help
```

## Under active development

We aim to have a version ready for production use end of June 2016. In the mean time feel free to contribute.

## Terminal Usage

```bash
##
# get general help and usage information
##
passmarked --help

##
# test a site
##
passmarked http://example.com

##
# test many sites with json output (default delimiter is \n)
##
passmarked --format json --output=outfile.json < mysites.txt

##
# comma-delimited string of addresses
##
passmarked google.com,example.com

##
# perform a crawl on a registered sites
##
passmarked -r google.com,example.com
```

See `--help` for all available properties and usage information.

## Open Sourced Web Standards

Passmarked is built to be a framework that can be used by anyone, all our rules that [passmarked.com](https://passmarked.com) checks are open and available for use.

List of provided test suites that anyone can run:

### Performance

* [Network](https://www.npmjs.com/package/@passmarked/network)
* [Inspect](https://www.npmjs.com/package/@passmarked/inspect)

### Compatibility

* [HTML](https://www.npmjs.com/package/@passmarked/html)
* [CSS](https://www.npmjs.com/package/@passmarked/css)
* [Javascript](https://www.npmjs.com/package/@passmarked/javascript)
* [Mobile](https://www.npmjs.com/package/@passmarked/mobile)

### SEO

* [Links](https://www.npmjs.com/package/@passmarked/links)
* [SEO](https://www.npmjs.com/package/@passmarked/seo)
* [Social](https://www.npmjs.com/package/@passmarked/social)
* [Spellcheck](https://www.npmjs.com/package/@passmarked/spellcheck)

### Security

* [HTTP](https://www.npmjs.com/package/@passmarked/http)
* [Malware](https://www.npmjs.com/package/@passmarked/malware)
* [SSL](https://www.npmjs.com/package/@passmarked/ssl)

> Wrote your own ? Open a PR on the [Passmarked](https://github.com/passmarked/passmarked) repo with your new worker added to the list.

The Passmarked module  also provides a way to easily download and run the tests in your own apps, and even write your own:

```javsacript
// require the main module
var passmarked = require('passmarked');
// using promises
var runner = passmarked.create(

  require('@passmarked/network'),
  require('@passmarked/inspect')

);
runner.run({

  url: 'http://io.co.za'

}).then(function(rules) {

  for(var i = 0; i < rules.length; i++) {

    console.log('* ' + rules[i].getMessage());

  }

}).catch(function(err) {

  console.error(err);

});
// using callbacks
var runner = passmarked.create(

  require('@passmarked/network'),
  require('@passmarked/inspect')

);
runner.run({

  url: 'http://io.co.za'

}, function(err, rules) {

  console.error(err);

  for(var i = 0; i < rules.length; i++) {

    console.log('* ' + rules[i].getMessage());

  }

});
```

## Module

The module can also be used as a regular NodeJS module that allows programs to integrate quickly with the Passmarked system.

### API

* [Authentication](https://github.com/passmarked/passmarked/wiki/authentication)
* [createReport](https://github.com/passmarked/passmarked/wiki/createReport)
* [getReport](https://github.com/passmarked/passmarked/wiki/getReport)
* [getWebsites](https://github.com/passmarked/passmarked/wiki/getWebsites)
* [getProfile](https://github.com/passmarked/passmarked/wiki/getProfile)
* [getBalance](https://github.com/passmarked/passmarked/wiki/getBalance)
* [getBalance](https://github.com/passmarked/passmarked/wiki/getBalance)

### Quick start

#### Install

```bash
npm install --save
```

#### Test a single page

Run a single page and return all issues and information gathered from the page.

```javascript
var passmarked = require('passmarked');

// create and run a report, waiting for it to finish
var report = passmarked.createReport({

  url:     'http://example.com',
  token:   '<token>'

});
report.on('done', function(err, data) {

  var result = this.getResult();
  console.log('done with a score of ' + result.getScore());
  console.dir(result.toJSON());

});
report.on('update', function() {

  var result = this.getResult();
  console.log(result.countPendingTests() + "/" + result.countTests());

});
report.start(function(err) {

  if(err) {

    console.log('Something went wrong starting the report');
    console.error(err);

  } else {

    console.log('Report started');

  }

});
```

#### Run a recursive report over a entire domain

Example running a site wide report, requested websites must be registered on [passmarked.com](http://passmarked.com)

```javascript
// create and run a report, waiting for it to finish
var report = passmarked.createReport({

  url:         'http://example.com',
  token:       '<token>',
  recursive:   true,
  limit:       50,
  bail:        true,
  patterns:    [  ]

});
report.on('done', function(err) {

  var result = this.getResult();
  console.log('done with a score of ' + result.getScore() + ' after going through ' + result.countPages() + ' pages');
  console.dir(result.toJSON());

});
report.on('page', function(err, page) {

  console.log('Processed page - ' + page.getURL() + ' score ' + page.getScore());

});
report.on('update', function(err) {

  var result = this.getResult();
  console.log('pages ' + result.countProcessedPages() + '/' + result.countPages());

});
report.start(function(err, crawl) {

  if(err) {

    console.log('problem starting the recursive report');
    console.error(err);

  } else {

    console.log('crawl started');

  }

});

```

#### Download historical report for a page

The following shows how to download a single historical report from our archive.

```javascript
// return a historical report from the service
passmarked.getReport('2016049a03452018', function(err, report){

  // output the report info
  console.error(err);
  console.dir(report.getURL());
  console.dir(report.toJSON());

});
```

#### Registered websites

Returns the list of websites that the given token has access to.

```javascript
// get the list of registered websites for the user
passmarked.getWebsites(<token>, function(err, websites) {

  // output information from call
  console.error(err);
  for(var i = 0; i < websites.length; i++) {

    console.log('-> ' + websites.getDomain());

  }

});
```

## Contributing

1. Fork the project
2. Write a test that reproduces the bug
3. Fix the bug without breaking any of the existing tests
4. Submit a pull request

We're busy building the tests and refactoring code as we go. If you spot any area that could use help feel free to open a PR.


## License

Copyright 2016 Passmarked Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
