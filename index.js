#! /usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer');
const args = require('yargs').argv;
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
