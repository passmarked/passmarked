
'use strict';

module.exports = require('yargs')
  .usage('Usage: $0 [options] <address>')
  .help('h').default('h', false).alias('h', 'help').describe('h', 'Show help and usage examples')
  .boolean('j').default('j', false).alias('j', 'json').describe('j', 'Output in JSON format')
  .boolean('p').default('p', false).alias('p', 'pretty').describe('p', 'Pretty-print JSON output')
  .boolean('q').default('q', false).alias('q', 'quiet').describe('q', 'Suppress output')
  .boolean('v').default('v', false).alias('v', 'version').describe('v', 'Display program version')
  .boolean('s').default('s', false).alias('s', 'submit').describe('s', 'Submit the address for testing')
  .string('d').default('d', '\n').alias('d', 'delimiter').describe('d', 'Delimiter for address list')
  .string('o').default('o', null).alias('o', 'output').describe('o', 'Output file path')
  .string('a').default('a', null).alias('a', 'address').describe('a', 'Address to query')
  .example('$0 http://example.com', 'Test example.com and print results to STDOUT')
  .example('$0 -a http://example.com', 'Test example.com and print results to STDOUT')
  .example('$0 -j -a http://example.com', 'Test example.com with JSON output')
  .example('$0 -j -o results.json -a http://example.com', 'Test example.com with JSON output')
  .example('$0 -j -o results.json -a http://example.com', 'Test example.com with JSON output')
  .example('$0 -j -o results.json -d , < sites.txt', 'Test a comma-delimited list of addresses')
  .example('$0 -j -o results.json < sites.txt', 'Test a newline-delimited list of addresses')
  .epilog('https://passmarked.com/\nCopyright 2015 Passmarked Inc.')
  .argv;
