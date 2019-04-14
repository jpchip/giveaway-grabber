/* global document */
const {
	asyncForEach,
	sendSystemNotification,
	checkStringForWords
} = require('./utils');
const sgMail = require('@sendgrid/mail');
var Tesseract = require('tesseract.js');

/**
 * Checks if giveaway has already been entered
 * @param {Puppeteer.Page} page
 * @returns {Promise<boolean>}
 */
async function alreadyEntered(page) {
	//check if already entered
	let alreadyEntered = false;
	try {
		await page.waitForSelector('.qa-giveaway-result-text', {
			timeout: 1000
		});
		alreadyEntered = true;
	} catch (error) {
		//nothing to do here...
	}
	return alreadyEntered;
}

/**
 * Check if we've been redirected to switch account page,
 * and if so, click to log back in
 * @param {Puppeteer.Page} page
 * @returns {Promise<void>}
 */
async function checkForSwitchAccount(page) {
	try {
		await page.waitForSelector('.cvf-widget-form-account-switcher', {
			timeout: 500
		});
		console.log('On switch account page');
		const switchAccountPromise = page.waitForNavigation();
		await page.click('.cvf-account-switcher-spacing-top-micro');
		await switchAccountPromise;
	} catch (error) {
		//nothing to do here...
	}
}

/**
 * Check if there's a captcha,
 * and if so, wait until user enters it.
 * @todo email user so they know it stopped?
 * @param {Puppeteer.Page} page
 * @returns {Promise<void>}
 */
async function checkForCaptcha(page) {
	try {
		await page.waitForSelector('#image_captcha', { timeout: 500 });
		const message = 'ENTER CAPTCHA!';
		console.log(message);
		const notification = {
			title: 'giveaway-grabber',
			message: message
		};
		sendSystemNotification(notification);
		await page.waitForSelector('.a-dynamic-image', { timeout: 1000 });
		const url = await page.$eval(
			'img[src*="opfcaptcha-prod"]',
			el => el.src
		);
		const tessValue = await Tesseract.recognize(url).then(function(result) {
			return result;
		});
	    console.log("OCR Value:  " + tessValue.text.trim().replace(" ", ""));
		await page.waitForSelector('#image_captcha_input');
		await page.click('#image_captcha_input');
		await page.type('#image_captcha_input', tessValue.text.trim().replace(" ", ""));
		await page.click('#image_captcha_input');
		await page.click('.a-button-input');
		await page.waitFor(() => !document.querySelector('#image_captcha'), {
			timeout: 0
		});
	} catch (error) {
		//nothing to do here...
	}
}

/**
 * Check if we've been redirected to enter password page,
 * and if so, enter password and click to log back in
 * @todo should be in signin.js?
 * @param {Puppeteer.Page} page
 * @param {number} [pageNumber]
 * @returns {Promise<void>}
 */
async function checkForPassword(page, pageNumber) {
	try {
		await page.waitForSelector('#ap_password', { timeout: 500 });
		console.log('Whoa, got to re-enter password!');
	} catch (error) {
		//no password field so return
		return;
	}

	await page.click('#ap_password');
	await page.type('#ap_password', process.env.AMAZON_PASSWORD);

	try {
		await page.waitForSelector('#signInSubmit', { timeout: 500 });
	} catch (error) {
		//no submit button, user must have clicked it themselves...
		return;
	}

	const signInPromise = page.waitForNavigation();
	await page.click('#signInSubmit');
	await signInPromise;

	if (pageNumber) {
		await page.goto(
			'https://www.amazon.com/ga/giveaways?pageId=' + pageNumber
		);
	}
}

/**
 * Checks if given giveaway entry is blacklisted, returns
 * keyword from blacklist on match.
 * @param page
 * @param giveawayNumber
 * @returns {Promise<string|null>}
 */
async function isBlackListed(page, giveawayNumber) {
	try {
		if (!process.env.BLACKLIST || process.env.BLACKLIST === '') {
			return null;
		}

		const giveawayTitleEl = await page.waitForSelector(
			`ul.listing-info-container > li.a-section.a-spacing-base.listing-item:nth-of-type(${giveawayNumber}) .prize-title`,
			{ timeout: 500 }
		);
		const giveawayTitleText = await page.evaluate(
			giveawayTitleEl => giveawayTitleEl.textContent,
			giveawayTitleEl
		);

		return checkStringForWords(
			String(process.env.BLACKLIST),
			giveawayTitleText
		);
	} catch (error) {
		return null;
	}
}

/**
 * Check if giveaway has ended
 * @param {Puppeteer.Page} page
 * @returns {Promise<boolean>}
 */
async function hasGiveawayEnded(page) {
	try {
		await page.waitForSelector('#giveaway-ended-header', { timeout: 500 });
	} catch (error) {
		return false;
	}
	return true;
}

/**
 * Clicks on given number giveaway
 * @param {Puppeteer.Page} page
 * @param {number} giveawayNumber
 * @returns {Promise<void>}
 */
async function navigateToGiveaway(page, giveawayNumber) {
	const giveawayItemPromise = page.waitForNavigation();
	await page.click(
		`ul.listing-info-container > li.a-section.a-spacing-base.listing-item:nth-of-type(${giveawayNumber}) a.item-link`
	);
	await giveawayItemPromise;
}

/**
 * Checks for the result of the giveaway entry and log appropriately.
 * Returns true if result found, false if not.
 * @param {Puppeteer.Page} page
 * @returns {Promise<boolean>}
 */
async function handleGiveawayResult(page) {
	try {
		const resultTextEl = await page.waitForSelector(
			'.qa-giveaway-result-text'
		);
		const resultText = await page.evaluate(
			resultTextEl => resultTextEl.textContent,
			resultTextEl
		);
		console.log(resultText);
		if (resultText.includes('won')) {
			const notification = {
				title: 'giveaway-grabber',
				message: resultText
			};
			sendSystemNotification(notification);

			const winningEntryUrl = 'Winning Entry URL: ' + page.url();
			console.log(winningEntryUrl);
			if (process.env.SENDGRID_API_KEY) {
				sgMail.setApiKey(process.env.SENDGRID_API_KEY);
				const msg = {
					to: process.env.AMAZON_USERNAME,
					from: process.env.AMAZON_USERNAME,
					subject: 'giveaway-grabber: You won!',
					text: winningEntryUrl
				};
				if (process.env.SENDGRID_CC) {
					msg.cc = process.env.SENDGRID_CC;
				}
				console.log('sending email');
				await sgMail.send(msg);
			}
		}
		return true;
	} catch (error) {
		console.log('could not get result, oh well. Moving on!');
		return false;
	}
}

/**
 * Attempts to enter a no entry requirement type giveaway.
 * Will try again if it fails once.
 * @param {Puppeteer.Page} page
 * @param {boolean} [repeatAttempt]
 * @returns {Promise<void>}
 */
async function enterNoEntryRequirementGiveaway(page, repeatAttempt) {
	await checkForSwitchAccount(page);
	await checkForPassword(page);
	await checkForCaptcha(page);
	console.log('waiting for box...');
	try {
		await page.waitForSelector('.tapToSeeText', { visible: true });
		await page.waitFor(
			() => document.querySelector('.tapToSeeText').style.opacity === '1'
		);
		await page.waitForSelector('#box_click_target');
		await page.click('#box_click_target', { delay: 2000 });
	} catch (error) {
		console.log('could not find box?');
	}

	const resultFound = await handleGiveawayResult(page);
	if (!resultFound && !repeatAttempt) {
		console.log('lets try that again.');
		await enterNoEntryRequirementGiveaway(page, true);
	}
}

/**
 * Attempts to enter a video requirement type giveaway
 * @param {Puppeteer.Page} page
 * @returns {Promise<void>}
 */
async function enterVideoGiveaway(page) {
	await checkForSwitchAccount(page);
	await checkForPassword(page);
	await checkForCaptcha(page);
	console.log('waiting for video (~15 secs)...');
	try {
		await page.waitForSelector('#youtube-iframe', { timeout: 1000 });
	} catch (error) {
		console.log('could not find video, oh well. Moving on!');
		return;
	}

	await page.click('#youtube-iframe');
	await page.waitFor(15000);

	try {
		await page.waitForSelector(
			'#videoSubmitForm > .a-button-stack > #enter-youtube-video-button > .a-button-inner > .a-button-input'
		);
		await page.click(
			'#videoSubmitForm > .a-button-stack > #enter-youtube-video-button > .a-button-inner > .a-button-input'
		);
	} catch (error) {
		console.log('no submit button found, oh well. Moving on!');
		return;
	}

	await handleGiveawayResult(page);
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
		let giveawayExists = true;
		try {
			await page.waitForSelector(
				`.listing-info-container > .a-section:nth-of-type(${i})`,
				{ timeout: 5000 }
			);
		} catch (error) {
			console.log('giveaway ' + i + ' did not exist?');
			giveawayExists = false;
		}

		if (!giveawayExists) {
			// it's weird that it couldn't find a giveaway, let's make sure we
			// aren't on some other page...
			await checkForSwitchAccount(page);
			await checkForPassword(page, pageNumber);
			await checkForCaptcha(page);
			return;
		}

		const blackListed = await isBlackListed(page, i);
		if (blackListed) {
			console.log(
				'giveaway ' + i + ' is blacklisted [' + blackListed + '].'
			);
			return;
		}

		const noEntryRequired = await page.$x(
			`//ul[@class="listing-info-container"]/li[${i}]//a/div[2]/div[2]/span[contains(text(), "No entry requirement")]`
		);
		const videoRequired = await page.$x(
			`//ul[@class="listing-info-container"]/li[${i}]//a/div[2]/div[2]/span[contains(text(), "Watch a short video")]`
		);

		if (noEntryRequired.length > 0 || videoRequired.length > 0) {
			try {
				await navigateToGiveaway(page, i);
			} catch (error) {
				console.log('could not navigate to giveaway ' + i + '. Next!');
				return;
			}

			//check if ended
			let ended = await hasGiveawayEnded(page);
			if (ended) {
				console.log('giveaway ' + i + ' ended.');
				await page.goBack();
				return;
			}

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
			if (noEntryRequired.length > 0) {
				await enterNoEntryRequirementGiveaway(page);
			} else if (videoRequired.length > 0) {
				await enterVideoGiveaway(page);
			}

			//go back
			await page.goBack();
			await checkForSwitchAccount(page);
			await checkForPassword(page, pageNumber);
		} else {
			console.log('giveaway ' + i + ' cannot be entered.');
		}
	});

	//go to next page, if we can
	try {
		await page.waitForSelector(
			'ul.a-pagination li:last-child:not(.a-disabled)'
		);
	} catch (e) {
		console.log('No more pages! Goodbye!');
		return;
	}

	const navigationPromise = page.waitForNavigation();
	await page.click('ul.a-pagination li:last-child:not(.a-disabled)');
	await navigationPromise;

	console.log('Next Page!');
	await enterGiveaways(page, pageNumber + 1);
}

module.exports = {
	enterGiveaways
};
