#! /usr/bin/env node

var chalk = require('chalk');
var request = require('request');
var validator = require('validator');

var domain = process.argv[2];
if (!validator.isFQDN(domain)) {
  if (!domain) return console.log(chalk.red('You must supply a valid url'));
  return console.log(chalk.red('That isn\'t a valid url'));
}

var queryUrl = 'http://api.passmarked.com/query?domain='+domain;

request(queryUrl, handleReply);

function handleReply(err, response, body) {
  if (err) return console.error(err);

  var result = JSON.parse(body);

  // TODO: if the url wasn't scraped before, we have to manually submit the url first.
  if (!result.score) return console.log(chalk.red('Results not available'));
  console.log('Score:', result.score);
  console.log('Count:', result.count);
}
