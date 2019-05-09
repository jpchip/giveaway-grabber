#! /usr/bin/env node

const puppeteer = require('puppeteer');
const findUp = require('find-up');
const fs = require('fs');
const { enterGiveaways } = require('./src/giveaways');
const signIn = require('./src/signIn');
const sqlite = require('./src/database');

//look for config file
const configPath = findUp.sync(['.ggrc.json']);
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : undefined;

//set up CLI
const args = require('yargs')
	.scriptName('gg')
	.command(require('./src/init'))
	.describe('page', 'page to start script on')
	.number('page')
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

//A common location for performing DB upgrades
async function updateDB() {
	await sqlite.open('./gg.db');
	let version = -1;
	var r = null;
	try {
		r = await sqlite.run(
			'CREATE TABLE version(vers integer NOT NULL PRIMARY KEY)'
		);
		if (r) {
			console.log('Table created');
		}
	} catch (e) {
		//Do nothing.
	}

	r = await sqlite.get('SELECT vers FROM version');
	if (typeof r === 'undefined') {
		var pRet = await sqlite.run('INSERT INTO version (vers) VALUES (0)');
		if (pRet) {
			console.log('Version initialized to 0');
			version = 0;
		}
	} else {
		version = r.vers;
	}

	if (version == 0) {
		var pRet = sqlite.run(
			'CREATE TABLE GG_DATA(sweepURL VARCHAR(100) NOT NULL PRIMARY KEY, ' +
				'processCode VARCHAR(1), ' +
				'dateChecked TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)'
		);
		if (pRet) {
			console.log('Created URL Table');
		}
		pRet = sqlite.run('UPDATE version set vers = 1');
		if (pRet) {
			console.log('Set DB Version to 1');
			version = 1;
		}
	}
	await sqlite.close();
}

//start index code
(async () => {
	let config = {
		headless: false,
		args: ['--mute-audio']
	};
	if (args['remember_me']) {
		config.userDataDir = './user_data';
	}
	const browser = await puppeteer.launch(config);
	const page = await browser.newPage();

	//initialize database and perform any upgrades
	await updateDB();

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

	//enter giveaways
	await enterGiveaways(page, args.page || 1);

	await browser.close();
})();
