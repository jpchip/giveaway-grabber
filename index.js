#! /usr/bin/env node

const puppeteer = require('puppeteer');
const findUp = require('find-up');
const fs = require('fs');

const configPath = findUp.sync(['.ggrc.json']);
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : undefined;


const args = require('yargs')
	.scriptName("gg")
	.command(require('./src/init'))
	.describe('page', 'page to start script on')
	.number('page')
	.describe('config', 'optional path to JSON config file')
	.string('config')
	.config(config)
	.help()
	.argv;


if(args._[0] === 'init') {
	return;
}
console.log(args);

const username = process.env.AMAZON_USERNAME || args.username;
const password = process.env.AMAZON_PASSWORD || args.password;
if (!username || !password) {
	console.error('Missing required username and/or password!');
	return;
}

process.exit(0);

const { enterGiveaways } = require('./src/giveaways');
const signIn = require('./src/signIn');

//start index code
(async () => {
	const username = process.env.AMAZON_USERNAME || args.username;
	const password = process.env.AMAZON_PASSWORD || args.password;
	if (!username || !password) {
		console.error('Missing required username and/or password!');
		return;
	}
	//add to process.env to be used elsewhere if needed
	process.env.AMAZON_USERNAME = username;
	process.env.AMAZON_PASSWORD = password;
	if (args.blacklist) {
		process.env.BLACKLIST = args.blacklist;
	}
	if (args.SENDGRID_API_KEY) {
		process.env.SENDGRID_API_KEY = args.SENDGRID_API_KEY;
	}
	if (args.SENDGRID_CC) {
		process.env.SENDGRID_CC = args.SENDGRID_CC;
	}

	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	let pageNumber = 1;
	if (args.page) {
		pageNumber = args.page;
	}

	//sign in
	await signIn(
		page,
		username,
		password,
		pageNumber,
		args.hasOwnProperty('2FA')
	);

	//enter giveaways
	await enterGiveaways(page, args.page || 1);

	await browser.close();
})();
