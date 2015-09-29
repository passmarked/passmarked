
# passmarked-cli

[![Build Status](https://travis-ci.org/passmarked/cli.svg)](https://travis-ci.org/passmarked/cli)
[![Code Climate](https://codeclimate.com/github/passmarked/cli/badges/gpa.svg)](https://codeclimate.com/github/passmarked/cli)
[![Test Coverage](https://codeclimate.com/github/passmarked/cli/badges/coverage.svg)](https://codeclimate.com/github/passmarked/cli/coverage)
[![Dependency Status](https://david-dm.org/passmarked/cli.svg)](https://david-dm.org/passmarked/cli)
[![devDependency Status](https://david-dm.org/passmarked/cli/dev-status.svg)](https://david-dm.org/passmarked/cli#info=devDependencies)

A command-line interface to the [Passmarked](https://passmarked.com) web API

##### Installation

```
npm install --global passmarked
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

##### Contributing

Clone, install dev-dependencies and (ideally) pull request discrete features complemented with tests in branches.
