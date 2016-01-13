
# passmarked-cli [![Build Status](https://travis-ci.org/passmarked/cli.svg)](https://travis-ci.org/passmarked/cli) [![Code Climate](https://codeclimate.com/github/passmarked/cli/badges/gpa.svg)](https://codeclimate.com/github/passmarked/cli) [![devDependency Status](https://david-dm.org/passmarked/cli/dev-status.svg)](https://david-dm.org/passmarked/cli#info=devDependencies) [![Dependency Status](https://david-dm.org/passmarked/cli.svg)](https://david-dm.org/passmarked/cli) [![Test Coverage](https://codeclimate.com/github/passmarked/cli/badges/coverage.svg)](https://codeclimate.com/github/passmarked/cli/coverage)

> CLI based tool for the [Passmarked](https://passmarked.com) API that can be used for easy integrations and general horse play

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
# test many sites with json output (default delimiter is \n)
passmarked --json --output=outfile.json < mysites.txt
# comma-delimited string of addresses
echo "google.com,example.com" | passmarked --delimiter=,
```

##### Contributing

1. Fork the project
2. Write a test that reproduces the bug
3. Fix the bug without breaking any of the existing tests
4. Submit a pull request
