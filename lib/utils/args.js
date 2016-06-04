
'use strict';

module.exports = require('yargs')
  .usage('Usage: $0 [options] <address>')

  .string('f')
  .default('f', 'text')
  .alias('f', 'format')
  .describe('f', 'Format of the output')
  .choices('f', ['text','json'])

  .boolean('tty')
  .default('tty', false)
  .describe('tty', 'Treat as a Text Terminal, not rendering the UI')

  /* .boolean('pretty')
  .default('pretty', false)
  .describe('pretty', 'Pretty-print the output') */

  .boolean('verbose')
  .default('verbose', false)
  .describe('verbose', 'Enable debugging logs')

  .boolean('streaming')
  .default('streaming', false)
  .alias('streaming', 'stream')
  .describe('streaming', 'Enable streaming updates')

  .boolean('r')
  .default('r', false)
  .alias('r', 'recursive')
  .describe('r', 'Crawl the entire website')

  .string('level')
  .default('level', 'all')
  .describe('level', 'Format of the output')
  // .choices('level', ['all','critical','error','warning','info'])

  .boolean('p')
  .default('p', false)
  .alias('p', 'pattern')
  .describe('p', 'Patterns to whitelist')

  .boolean('q')
  .default('q', false)
  .alias('q', 'quiet')
  .describe('q', 'Suppress output')

  .string('d')
  .default('d', null)
  .alias('d', 'delimiter')
  .describe('d', 'Delimiter for address list')

  .string('o')
  .default('o', null)
  .alias('o', 'output')
  .describe('o', 'Output file path')

  .command('help', 'Show help and usage examples')
  .help('h')
  .default('h', false)
  .alias('h', 'help')
  .describe('h', 'Show help and usage examples')

  .command('token', 'Set/get the current configured authentication token')
  .command('connect', 'Generates a url that will create a token for the once requested')
  .command('disconnect', 'Removes the current authenticated token')

  .command('version', 'Display program version')
  .boolean('v')
  .default('v', false)
  .alias('v', 'version')
  .describe('v', 'Display program version')

  .example('$0 http://example.com', 'Test example.com and print results to STDOUT')
  .example('$0 -a http://example.com', 'Test example.com and print results to STDOUT')
  .example('$0 -j -a http://example.com', 'Test example.com with JSON output')
  .example('$0 -j -o results.json -a http://example.com', 'Test example.com with JSON output')
  .example('$0 -j -o results.json -a http://example.com', 'Test example.com with JSON output')
  .example('$0 -j -o results.json -d , < sites.txt', 'Test a comma-delimited list of addresses')
  .example('$0 -j -o results.json < sites.txt', 'Test a newline-delimited list of addresses')
  .epilog('https://passmarked.com/\nCopyright 2016 Passmarked Inc.')
  .argv;
