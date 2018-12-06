#! /usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer');
const args = require('yargs').argv;
const { enterGiveaways } = require('./src/giveaways');
const signIn = require('./src/signIn');

//start index code
(async () => {
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();

	//sign in
	const username = process.env.AMAZON_USERNAME;
	const password = process.env.AMAZON_PASSWORD;
	await signIn(page, username, password);

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
