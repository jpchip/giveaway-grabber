#! /usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer');
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
	await page.goto('https://www.amazon.com/ga/giveaways');

	//enter giveaways
	await enterGiveaways(page, 1);

	await browser.close();
})();
