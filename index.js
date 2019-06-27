#! /usr/bin/env node

const puppeteer = require('puppeteer');
const findUp = require('find-up');
const fs = require('fs');
const { enterGiveaways, unfollowGiveaways } = require('./src/giveaways');
const signIn = require('./src/signIn');
const sqlite = require('./src/database');
const { updateDB } = require('./src/updateDB');

//look for config file
const configPath = findUp.sync(['.ggrc.json']);
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : undefined;

//set up CLI
const args = require('yargs')
	.scriptName('gg')
	.command(require('./src/init'))
	.describe('page', 'page to start script on')
	.number('page')
	.describe('unfollow', 'unfollow giveaways script')
	.boolean('unfollow')
	.describe('config', 'path to JSON config file')
	.string('config')
	.config(config)
	.help().argv;

if (args._[0] === 'init') {
	return;
}

const username = args.username;
const password = args.password;
if (!username || !password) {
	console.error(
		'Missing required username and/or password! Did you run `gg init`?'
	);
	return;
}

//add args to process.env to be used elsewhere if needed
process.env.AMAZON_USERNAME = username;
process.env.AMAZON_PASSWORD = password;
if (args.blacklist && args.blacklist !== '') {
	process.env.BLACKLIST = args.blacklist;
}
if (args.sendgrid_api_key && args.sendgrid_api_key !== '') {
	process.env.SENDGRID_API_KEY = args.sendgrid_api_key;
}
if (args.sendgrid_cc && args.sendgrid_cc !== '') {
	process.env.SENDGRID_CC = args.sendgrid_cc;
}
if (args.chromeExecutablePath && args.chromeExecutablePath !== '') {
	process.env.CHROME_EXECUTABLE_PATH = args.chromeExecutablePath;
}
process.env.MINIMUM_PRICE = args.minimum_price || 0;
process.env.FOLLOW_GIVEAWAY = args.follow_giveaway || false;
process.env.UNFOLLOW_UPDATES =
	args.unfollow || args._.includes('unfollow') || false;

//start index code
(async () => {
	let config = {
		headless: false,
		args: ['--mute-audio']
	};
	if (args['remember_me']) {
		config.userDataDir = './user_data';
	}
	if (process.env.CHROME_EXECUTABLE_PATH) {
		config.executablePath = args['chromeExecutablePath'];
	}
	const browser = await puppeteer.launch(config);
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
		args['2FA'],
		args['remember_me']
	);

	await sqlite.open('./gg.db');

	//initialize database and perform any upgrades
	await updateDB();

	if (process.env.UNFOLLOW_UPDATES == 'true') {
		await unfollowGiveaways(page);
	}
	//enter giveaways
	else {
		await enterGiveaways(page, args.page || 1);
	}

	await sqlite.close();

	await browser.close();
})();
