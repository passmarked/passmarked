
# passmarked-cli

[![Build Status](https://travis-ci.org/passmarked/cli.svg)](https://travis-ci.org/passmarked/cli)
[![Coverage Status](https://coveralls.io/repos/passmarked/cli/badge.svg?branch=master&service=github)](https://coveralls.io/github/passmarked/cli?branch=master)
[![Dependency Status](https://david-dm.org/passmarked/cli.svg)](https://david-dm.org/passmarked/cli)
[![devDependency Status](https://david-dm.org/passmarked/cli/dev-status.svg)](https://david-dm.org/passmarked/cli#info=devDependencies)

A command-line interface to the Passmarked web API

##### Installation

```
npm install --global passmarked-cli
```

##### Usage

```bash
# get general help and usage information
passmarked --help
# test a site
passmarked http://example.com
# test many sites with json output
passmarked --json --output=outfile.json < mysites.txt
```
