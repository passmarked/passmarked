
# Passmarked 

![NPM](https://img.shields.io/npm/dt/passmarked.svg) [![Build Status](https://travis-ci.org/passmarked/cli.svg)](https://travis-ci.org/passmarked/cli)  [![Test Coverage](https://codeclimate.com/github/passmarked/cli/badges/coverage.svg)](https://codeclimate.com/github/passmarked/cli/coverage)

CLI based tool for the [Passmarked](https://passmarked.com) API that can be used for easy integrations and general horse play. Intended to by usable as a simple tool for your development workflow but also usable on services like Jenkins and other CI environments.

## Install

### NPM

```
npm install -g passmarked
```

View the project at [npmjs.com/package/passmarked](https://www.npmjs.com/package/passmarked).

### From Source

To build from source:

```bash
git clone git@github.com:passmarked/cli.git passmarked/
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
passmarked --json --output=outfile.json < mysites.txt

##
# comma-delimited string of addresses
##
passmarked google.com,example.com

##
# perform a crawl on a registered sites
##
passmarked -r google.com,example.com
```

## Module

The module can also be used as a regular NodeJS module that allows programs to integrate quickly with the Passmarked system.

```bash
npm install --save
```

and to use:

```javascript
var passmarked = require('passmarked');

// create and run a report, waiting for it to finish
var report = passmarked.createReport({

	url: 	'http://io.co.za',
	token: 	'<token>'

});
report.on('done', function(err, data) {

	console.log('done with a score of ' + data.score)

});
report.on('progress', function(err, data) {

	console.log('done with a score of ' + data.score)

});
report.start(function(err, data) {

	console.log('Report started');

});

// return a historical report from the service
passmarked.getReport('2016049a03452018', function(err, report){

	// output the report info
	console.dir(err);	
	console.dir(data);

});

// get the list of registered websites for the user
passmarked.getWebsites(<token>, function(err, websites) {

	// create and run a report, waiting for it to finish
	var report = passmarked.createCrawl({
	
		websiteid: 	1,
		token: 		'<token>'

	});
	report.on('done', function(err, crawl) {

		console.log('done with a score of ' + report.score + ' after going through ' + crawl.pages + ' pages')

	});
	report.on('progress', function(err, crawl) {

		console.log('pages ' + crawl.processed + '/' + crawl.pages)

	});
	report.start(function(err, crawl) {
	
		console.log('crawl started')
	
	});

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
