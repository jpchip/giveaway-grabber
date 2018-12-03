/*global process, console */
require('dotenv').config();
const puppeteer = require('puppeteer');


async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

async function navigateBackToGiveaways(page) {
	const navigationPromise = page.waitForNavigation();
	await page.waitForSelector('#giveaway-default-return-link-button');
	await page.click('#giveaway-default-return-link-button');
	return await navigationPromise;
}

(async () => {
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();

	//sign in
	await page.goto('https://www.amazon.com/ap/signin?_encoding=UTF8&ignoreAuthState=1&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fgiveaway%2Fhome%2Fref%3Dnav_custrec_signin&switch_account=');
	const username = process.env.AMAZON_USERNAME;
	const password = process.env.AMAZON_PASSWORD;

	await page.waitForSelector('#ap_email');
	await page.click('#ap_email');
	await page.type('#ap_email', username);

	await page.waitForSelector('#ap_password');
	await page.click('#ap_password');
	await page.type('#ap_password', password);

	const signInPromise = page.waitForNavigation();
	await page.waitForSelector('#signInSubmit');
	await page.click('#signInSubmit');
	await signInPromise;

	//go to giveaways
	await page.goto('https://www.amazon.com/ga/giveaways');

	//loop through each giveaway item
	const giveawayKeys = new Array(24);
	await asyncForEach(giveawayKeys, async (val, index) => {
		let i = index + 1;
		try{
			await page.waitForSelector('#giveaway-grid > #giveaway-item-' + i, { timeout: 5000 });
		} catch(error) {
			console.log('giveaway ' + i + ' did not exist?');
			return;
		}

		//only do "no entry requirement" giveaways (for now)
		const noEntryRequired = await page.$x('//*[@id="giveaway-item-' + i +'"]/a/div[2]/div[2]/span[contains(text(), "No entry requirement")]');
		if (noEntryRequired.length > 0) {
			const giveawayItemPromise = page.waitForNavigation();
			await page.click('#giveaway-grid > #giveaway-item-' + i + ' > .a-link-normal > .a-section > .a-spacing-base');
			await giveawayItemPromise;

			//check if already entered
			let alreadyEntered = false;
			try{
				await page.waitForSelector('.qa-giveaway-result-text', { timeout: 1000 });
				alreadyEntered = true;
			} catch(error) {
				//nothing to do here...
				console.log('giveaway ' + i + ' is ready!');
			}
			if (alreadyEntered) {
				console.log('giveaway ' + i + ' already entered.');
				await navigateBackToGiveaways(page);
				return;
			}

			//try to win!
			await page.waitForSelector('#box_click_target');
			await page.click('#box_click_target');

			await navigateBackToGiveaways(page);
		} else {
			console.log('giveaway ' + i + ' requires entry.');
		}
	});

	//TODO: go to next page...

	await browser.close();
})();
