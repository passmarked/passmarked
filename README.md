
# passmarked-cli [![Build Status](https://travis-ci.org/passmarked/cli.svg)](https://travis-ci.org/passmarked/cli) [![Code Climate](https://codeclimate.com/github/passmarked/cli/badges/gpa.svg)](https://codeclimate.com/github/passmarked/cli)

> A command-line interface to the [Passmarked](https://passmarked.com) web API.

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

Fork the repository, clone your fork and use a branching workflow and pull-request your additions (ideally complemented with tests) to this repository.
