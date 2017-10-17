
'use strict';

module.exports = require('yargs')
  .usage('Usage: $0 [options] <address>')

  .command('user', 'Get the current configured authentication token profile')
  .command('connect', 'Generates a url that will create a token for the once requested')
  .command('invite', 'Requests invites to the Community Slack channel and mailing lists')
  .command('disconnect', 'Removes the current authenticated token')
  .command('get', 'Download/display the data of a single report')

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

  .boolean('beta')
  .default('beta', false)
  .describe('beta', 'Switch to the beta service')

  .boolean('bail')
  .default('bail', false)
  .describe('bail', 'Stops on the first matching error found')

  .boolean('open')
  .default('open', false)
  .describe('open', 'Opens a web browser with the resulting report')

  .boolean('dev')
  .default('dev', false)
  .describe('dev', 'Enable local testing environment')

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
  .default('filter', null)
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

  .example('$0 (STDIN)')
  .example('$0 http://example.com')
  .example('$0 http://example.com,example2.com')
  .example('$0 http://example.com --format=json')
  .example('$0 -o results.json --format=json http://example.com')
  .example('$0 -o results.json -i sites.txt')
  .example('$0 -o results.json -d , --format=json , < sites.txt')
  .example('$0 -o results.json -d "\n" --format=json < sites.txt')

  .command('help', 'Show help and usage examples')
  .help('h')
  .default('h', false)
  .alias('h', 'help')
  .describe('h', 'Show help and usage examples')

  .epilog('http://passmarked.com/\nCopyright ' + new Date().getFullYear() + ' Passmarked Inc.')
  .argv;
