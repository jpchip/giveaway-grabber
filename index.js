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

	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();

	//sign in
	await signIn(page, username, password, args.hasOwnProperty('2FA'));

	//go to giveaways
	let url = 'https://www.amazon.com/ga/giveaways';
	if (args.page) {
		url += '?pageId=' + args.page;
	}
	await page.goto(url);

	//enter giveaways
	await enterGiveaways(page, args.page || 1);

	await browser.close();
})();
