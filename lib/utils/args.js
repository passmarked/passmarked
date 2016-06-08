
'use strict';

module.exports = require('yargs')
  .usage('Usage: $0 [options] <address>')

  .command('whoami|me', 'Get the current configured authentication token profile')
  .command('connect', 'Generates a url that will create a token for the once requested')
  // .command('connect -token-', 'Sets a authentication token manually')
  .command('disconnect', 'Removes the current authenticated token')
  .command('get', 'Download/display the data of a single report')
  .command('websites', 'Retrieve registered websites for the authenticated token')
  // .command('websites example.com', 'Retrieve details about single registered website')
  /* .command('snapshots <domain>', 'Retrieve historical snapshots of website')
  .command('snapshots <domain> <path>', 'Retrieve historical snapshots by path')
  .command('snapshots <domain> <snapshotid>', 'Retrieve stats about single snapshot')
  .command('snapshots <domain> <snapshotid> <path>', 'Returns stats from snapshot by the path') */

  .command('version', 'Display program version')
  .boolean('v')
  .default('v', false)
  .alias('v', 'version')
  .describe('v', 'Display program version')

  .string('f')
  .default('f', 'text')
  .alias('f', 'format')
  .describe('f', 'Format of the output')
  .choices('f', ['text','json'])

  .boolean('bail')
  .default('bail', false)
  .describe('bail', 'Stops on the first matching error found')

  /* .boolean('combine')
  .default('combine', false)
  .describe('combine', 'Combine the listed rule results when displaying in text') */

  /* .boolean('tty')
  .default('tty', false)
  .describe('tty', 'Treat as a Text Terminal, not rendering the UI') */

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
  .describe('level', 'Only output errors equal or above to this level')

  .string('filter')
  .default('filter', 'text')
  .describe('filter', 'Only report on issues in the filter')

  .string('config')
  .default('config', null)
  .describe('config', 'Override where the config is read from, by default ~/.passmarked.json')

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

  .string('i')
  .default('i', null)
  .alias('i', 'in')
  .describe('i', 'Path to read targets from')

  .string('o')
  .default('o', null)
  .alias('o', 'output')
  .describe('o', 'Output file path')

  /* .boolean('dry')
  .default('dry', false)
  .describe('dry', 'Do a dry run, not actually submitting anything to the API.') */

  .example('$0 http://example.com', 'Test example.com and print results to STDOUT')
  .example('$0 -a http://example.com', 'Test example.com and print results to STDOUT')
  .example('$0 -a http://example.com', 'Test example.com with JSON output')
  .example('$0 -o results.json --format json -a http://example.com', 'Test example.com with JSON output')
  .example('$0 -o results.json --format json -a http://example.com', 'Test example.com with JSON output')
  .example('$0 -o results.json --format json -d , < sites.txt', 'Test a comma-delimited list of addresses')
  .example('$0 -o results.json --format json < sites.txt', 'Test a newline-delimited list of addresses')

  .command('help', 'Show help and usage examples')
  .help('h')
  .default('h', false)
  .alias('h', 'help')
  .describe('h', 'Show help and usage examples')

  .epilog('http://passmarked.com/\nCopyright 2016 Passmarked Inc.')
  .argv;
