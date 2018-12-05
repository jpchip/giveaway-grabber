const { asyncForEach } = require('./src/utils');

/**
 * Checks if giveaway has already been entered
 * @param {Puppeteer.Page} page
 * @returns {Promise<boolean>}
 */
async function alreadyEntered(page) {
	//check if already entered
	let alreadyEntered = false;
	try{
		await page.waitForSelector('.qa-giveaway-result-text', { timeout: 1000 });
		alreadyEntered = true;
	} catch(error) {
		//nothing to do here...
	}
	return alreadyEntered;
}

/**
 * Clicks on given number giveaway
 * @param {Puppeteer.Page} page
 * @param {number} giveawayNumber
 * @returns {Promise<void>}
 */
async function navigateToGiveaway(page, giveawayNumber) {
	const giveawayItemPromise = page.waitForNavigation();
	await page.click('#giveaway-grid > #giveaway-item-' + giveawayNumber + ' > .a-link-normal > .a-section > .a-spacing-base');
	await giveawayItemPromise;
}

/**
 * Attempts to enter a no entry requirement type giveaway
 * @param {Puppeteer.Page} page
 * @returns {Promise<void>}
 */
async function enterNoEntryRequirementGiveaway(page) {
	//try to win!
	console.log('waiting for box...');
	await page.waitForSelector('#box_click_target');
	await page.click('#box_click_target', {delay: 2000});
	try{
		const resultTextEl = await page.waitForSelector('.qa-giveaway-result-text');
		const resultText = await page.evaluate(resultTextEl => resultTextEl.textContent, resultTextEl);
		console.log(resultText);
	} catch(error) {
		console.log('could not get result, oh well. Moving on!');
	}
}

/**
 * Loops through giveaways on given page, tries to enter them
 * @param {Puppeteer.Page} page
 * @param {number} pageNumber current giveaways page (eg. www.amazon.com/ga/giveaways?pageId=5)
 * @returns {Promise<void>}
 */
async function enterGiveaways(page, pageNumber) {
	//loop through each giveaway item
	console.log('Page ' + pageNumber + ' Start:');
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
			await navigateToGiveaway(page, i);

			//check if already entered
			let isAlreadyEntered = await alreadyEntered(page);
			if (isAlreadyEntered) {
				console.log('giveaway ' + i + ' already entered.');
				await page.goBack();
				return;
			} else {
				console.log('giveaway ' + i + ' is ready!');
			}

			//try to win!
			await enterNoEntryRequirementGiveaway(page);

			await page.goBack();
		} else {
			console.log('giveaway ' + i + ' requires entry.');
		}
	});

	//go to next page, if we can
	try {
		await page.waitForSelector('.a-section > #giveawayListingPagination > .a-pagination > .a-last > a');
	} catch(e) {
		console.log('No more pages! Goodbye!');
		return;
	}

	const navigationPromise = page.waitForNavigation();
	await page.click('.a-section > #giveawayListingPagination > .a-pagination > .a-last > a');
	await navigationPromise;

	console.log('Next Page!');
	await enterGiveaways(page, pageNumber + 1);
}

module.exports = {
	enterGiveaways
};
