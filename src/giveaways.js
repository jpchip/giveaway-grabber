/* global document */
const {
	asyncForEach,
	sendSystemNotification,
	checkStringForWords,
	checkMinPrice
} = require('./utils');
const sgMail = require('@sendgrid/mail');
const Tesseract = require('tesseract.js');
const sqlite = require('./database');
const urlTypes = require('./globals');

let currentGiveawayUrl = '';

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
	if (!alreadyEntered) {
		try {
			const resultTextEl = await page.waitForSelector(
				'span.a-size-medium.a-color-secondary.a-text-bold.prize-title',
				{
					timeout: 1000
				}
			);
			const resultText = await page.evaluate(
				resultTextEl => resultTextEl.textContent,
				resultTextEl
			);
			if (!resultText.includes('chance')) {
				alreadyEntered = true;
			}
		} catch (error) {
			//nothing to do here...
		}
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
 * Check to see of we have been presented a sign in button.
 * Click it if we do.
 * @param {Puppeteer.Page} page
 * @returns {Promise<void>}
 */
async function checkForSignInButton(page) {
	try {
		await page.waitForSelector('a[class=a-button-text][role=button]', {
			timeout: 500
		});
		console.log('On Sign In Button');
		const signInButtonPromise = page.waitForNavigation();
		await page.click('a[class=a-button-text][role=button]');
		await signInButtonPromise;
		await page.waitForSelector('.cvf-widget-form-account-switcher', {
			timeout: 500
		});
		//Assume that we just advanced to the switch account page.
		await checkForSwitchAccount(page);
		//Go back to the switch account page after clicking though it.
		await page.goBack();
		//Go back to the page that had the Sign In Button
		await page.goBack();
		//Refresh the page to get a box or video.
		await page.reload();
	} catch (error) {
		//nothing to do here
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
		console.log('OCR Value:  ' + tessValue.text.trim().replace(' ', ''));
		await page.waitForSelector('#image_captcha_input');
		await page.click('#image_captcha_input');
		await page.type(
			'#image_captcha_input',
			tessValue.text.trim().replace(' ', '')
		);
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
 * Check if Price is greater than min
 * @param {Puppeteer.Page} page
 * @returns {Promise<boolean>}
 */
async function hasCostGreaterThanMinimum(page) {
	try {
		let resultTextEl;
		resultTextEl = await page.waitForSelector('.a-price-whole', {
			timeout: 500
		});
		const resultText = await page.evaluate(
			resultTextEl => resultTextEl.textContent,
			resultTextEl
		);

		const giveawayCostEl = resultText.substr(1);

		return checkMinPrice(
			Number(process.env.MINIMUM_PRICE),
			Number(giveawayCostEl)
		);
	} catch (error) {
		console.log('could not find the item cost, filter ignored!');
		return true;
	}
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
 * Retrieves the URL that will be navigated to.
 * This should be unique.
 * @param {Puppeteer.Page} page
 * @param {number} giveawayNumber
 * @returns {Promise<void>}
 */
async function getGiveawayURL(page, giveawayNumber) {
	let linkValue = '';
	try {
		linkValue = await page.$eval(
			`ul.listing-info-container > li.a-section.a-spacing-base.listing-item:nth-of-type(${giveawayNumber}) a.item-link`,
			a => a.getAttribute('href')
		);
	} catch (error) {
		//Not necessary to do error handling.
	}
	return linkValue;
}

/**
 * Checks for the result of the giveaway entry and log appropriately.
 * Returns true if result found, false if not.
 * @param {Puppeteer.Page} page
 * @returns {Promise<boolean>}
 */
async function handleGiveawayResult(page) {
	let resultTextEl;
	try {
		resultTextEl = await page.waitForSelector('.qa-giveaway-result-text', {
			timeout: 10000
		});
	} catch (error) {
		//could not find .qa-giveaway-result-text
	}
	if (!resultTextEl) {
		try {
			resultTextEl = await page.waitForSelector(
				'.a-text-bold.prize-title',
				{ timeout: 10000 }
			);
		} catch (error) {
			//could not find .a-text-bold.prize-title
		}
	}
	if (!resultTextEl) {
		console.log('could not find result text, oh well. Moving on!');
		return false;
	}

	try {
		const resultText = await page.evaluate(
			resultTextEl => resultTextEl.textContent,
			resultTextEl
		);
		console.log(resultText);
		const pageUrl = new URL(page.url()).pathname;

		if (resultText.includes('won')) {
			const notification = {
				title: 'giveaway-grabber',
				message: resultText
			};
			sendSystemNotification(notification);

			const winningEntryUrl = 'Winning Entry URL: ' + page.url();
			console.log(winningEntryUrl);
			if (
				process.env.SENDGRID_API_KEY &&
				process.env.SENDGRID_API_KEY !== ''
			) {
				sgMail.setApiKey(process.env.SENDGRID_API_KEY);
				const msg = {
					to: process.env.AMAZON_USERNAME,
					from: process.env.AMAZON_USERNAME,
					subject: 'giveaway-grabber: You won!',
					text: winningEntryUrl
				};
				if (process.env.SENDGRID_CC && process.env.SENDGRID_CC !== '') {
					msg.cc = process.env.SENDGRID_CC;
				}
				console.log('sending email');
				await sgMail.send(msg);
			}
			//Store that we won
			await setProcessingCode(urlTypes.WIN, currentGiveawayUrl);
		} else {
			// Store that we lost
			await setProcessingCode(urlTypes.LOST, currentGiveawayUrl);
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
	await checkForSignInButton(page);
	await checkForSwitchAccount(page);
	await checkForPassword(page);
	await checkForCaptcha(page);
	console.log('waiting for box...');
	let selector = null;
	try {
		await page.waitForSelector('.box-click-area', { timeout: 2000 });
		selector = '.box-click-area';
	} catch (error) {
		//could not find box-click-area
	}
	if (!selector) {
		try {
			await page.waitForSelector('#box_click_target', { timeout: 2000 });
			selector = '#box_click_target';
		} catch (error) {
			//could not find box_click_target
		}
	}

	try {
		await page.click(selector, { delay: 2000 });
	} catch (error) {
		console.log('could not find box?');
	}

	const resultFound = await handleGiveawayResult(page);
	if (!resultFound && !repeatAttempt) {
		console.log('lets try that again.');
		await enterNoEntryRequirementGiveaway(page, true);
	}
	return true;
}

/**
 * Attempts to enter a video requirement type giveaway
 * @param {Puppeteer.Page} page
 * @returns {Promise<void>}
 */
async function enterVideoGiveaway(page) {
	await checkForSignInButton(page);
	await checkForSwitchAccount(page);
	await checkForPassword(page);
	await checkForCaptcha(page);
	console.log('waiting for video (~15 secs)...');
	let selector = null;
	try {
		await page.waitForSelector('#youtube-iframe', { timeout: 5000 });
		selector = '#youtube-iframe';
	} catch (error) {
		//could not find #youtube-iframe
		console.log(
			'could not find #youtube-iframe, trying other selectors...'
		);
	}
	if (!selector) {
		try {
			await page.waitForSelector('.youtube-video', { timeout: 5000 });
			selector = '.youtube-video';
		} catch (error) {
			console.log('could not find .youtube-video');
		}
	}

	// if using Chrome instead of Chromium, check for other video types
	if (
		process.env.CHROME_EXECUTABLE_PATH &&
		process.env.CHROME_EXECUTABLE_PATH !== ''
	) {
		if (!selector) {
			try {
				await page.waitForSelector('#airy-container', {
					timeout: 5000
				});
				selector = '#airy-container';
			} catch (error) {
				console.log('could not find #airy-container');
			}
		}
		if (!selector) {
			try {
				await page.waitForSelector('div.amazon-video', {
					timeout: 5000
				});
				selector = 'div.amazon-video';
			} catch (error) {
				console.log('could not find div.amazon-video');
			}
		}
	}

	if (!selector) {
		console.log('could not find video, oh well. Moving on!');
		return;
	}

	await page.click(selector);
	await page.waitFor(16000);
	try {
		if (selector === '#youtube-iframe') {
			await page.waitForSelector(
				'#videoSubmitForm > .a-button-stack > #enter-youtube-video-button > .a-button-inner > .a-button-input'
			);
			await page.click(
				'#videoSubmitForm > .a-button-stack > #enter-youtube-video-button > .a-button-inner > .a-button-input'
			);
		} else if (selector === '#airy-container') {
			await page.waitForSelector('#enter-video-button > span > input');
			await page.click('#enter-video-button > span > input');
		} else if (selector === 'div.amazon-video') {
			await page.waitForSelector(
				'.amazon-video-continue-button > .a-button-inner'
			);
			await page.click('.amazon-video-continue-button > .a-button-inner');
		} else {
			await page.waitForSelector('.youtube-continue-button');
			await page.click('.youtube-continue-button');
		}
	} catch (error) {
		console.log('no submit button found, oh well. Moving on!');
		return;
	}

	await handleGiveawayResult(page);
}

/**
 * Normalized way to establish a way to set a code for the page.
 * @param {string} code the code associated with the processing for the page.
 * @param {string} giveawayUrl the URL for the page.
 * @returns {Promise<void>}
 */
async function setProcessingCode(code, giveawayUrl) {
	if (giveawayUrl.length > 0) {
		const responseInsert = await sqlite.run(
			'INSERT INTO GG_DATA (sweepURL, processCode) VALUES (?, ?)',
			[giveawayUrl, code]
		);
		if (!responseInsert) {
			const responseUpdate = await sqlite.run(
				'UPDATE GG_DATA SET process_code = (?), dateChecked = CURRENT_TIMESTAMP WHERE sweepURL = (?)',
				[code, giveawayUrl]
			);
			if (!responseUpdate) {
				console.log('Error saving entry status for ' + page.url());
			}
		}
	}
}

/**
 * Uses database to determine if the page should work like a blacklist page.
 * At this time, it will return true when any value is associated with the page.
 * Later, this can be expanded so certain pages can be reprocessed by allowing the code
 * and then letting them work.  This would be useful when certain new features that prevented
 * an entry due to technical requirements.
 * @param {String} giveawayUrl The URL that needs to be checked.
 * @returns {boolean} true if the page should be skipped or false otherwise.
 */
async function isSkippable(giveawayUrl) {
	var response = await sqlite.get(
		'SELECT processCode FROM GG_DATA WHERE sweepURL = ?',
		[giveawayUrl]
	);
	return typeof response !== 'undefined';
}

/**
 * A function that sleeps for the specified number of milliseconds.
 * @param {number} millis the milliseconds to sleep for.
 * @returns {Promise<void>}
 */
function sleep(millis) {
	return new Promise(resolve => setTimeout(resolve, millis));
}

/**
 * Attempts to enter a follow requirement type giveaway
 * @param {Puppeteer.Page} page
 * @param {boolean} [repeatAttempt]
 * @returns {Promise<void>}
 */
async function enterFollowGiveaway(page, repeatAttempt) {
	await checkForSignInButton(page);
	await checkForSwitchAccount(page);
	await checkForPassword(page);
	await checkForCaptcha(page);
	console.log('waiting for follow button...');

	let foundFollowBtn = true;
	try {
		await page.waitForSelector('.follow-author-continue-button', {
			timeout: 5000
		});
		await page.click('.follow-author-continue-button', { delay: 2000 });
	} catch (error) {
		console.log(
			'could not find follow button, trying to click box instead'
		);
		foundFollowBtn = false;
	}

	if (foundFollowBtn) {
		const resultFound = await handleGiveawayResult(page);
		if (!resultFound && !repeatAttempt) {
			console.log('lets try that again.');
			await enterFollowGiveaway(page, true);
		}
	} else {
		await enterNoEntryRequirementGiveaway(page, false);
	}
}

async function enterWinnerPromoCardGiveaway(page, repeatAttempt) {
	await checkForSignInButton(page);
	await checkForSwitchAccount(page);
	await checkForPassword(page);
	await checkForCaptcha(page);

	let selector = null;
	try {
		await page.waitForSelector('.box-click-area', { timeout: 2000 });
		selector = '.box-click-area';
	} catch (error) {
		//could not find box-click-area
	}
	if (!selector) {
		try {
			await page.waitForSelector('#box_click_target', { timeout: 2000 });
			selector = '#box_click_target';
		} catch (error) {
			//could not find box_click_target
		}
	}

	if (selector) {
		await enterNoEntryRequirementGiveaway(page, true);
	} else {
		await enterVideoGiveaway(page);
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
			await checkForSignInButton(page);
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

		let giveawayUrl = await getGiveawayURL(page, i);
		if (giveawayUrl.length > 0) {
			currentGiveawayUrl = giveawayUrl.substring(
				0,
				giveawayUrl.indexOf('?')
			);
			const skippable = await isSkippable(currentGiveawayUrl);
			if (skippable) {
				console.log(
					'giveaway ' + i + ' has already been checked per DB record.'
				);
				await sleep(500);
				return;
			}
		} else {
			currentGiveawayUrl = '';
		}
		console.log('giveaway ' + i + ' url: ' + currentGiveawayUrl);

		const noEntryRequired = await page.$x(
			`//ul[@class="listing-info-container"]/li[${i}]//a/div[2]/div[2]/span[contains(text(), "No entry requirement")]`
		);
		const videoRequired = await page.$x(
			`//ul[@class="listing-info-container"]/li[${i}]//a/div[2]/div[2]/span[contains(text(), "Watch a short video")]`
		);
		const followRequired = await page.$x(
			`//ul[@class="listing-info-container"]/li[${i}]//a/div[2]/div[2]/span[contains(text(), "Follow")]`
		);
		const winnerPromoCard = await page.$x(
			`//ul[@class="listing-info-container"]/li[${i}]//div[@class="winner-promo-card"]//a`
		);

		if (
			!(process.env.FOLLOW_GIVEAWAY == 'true') &&
			followRequired.length > 0
		) {
			console.log('giveaway ' + i + ' is of follow type. Next!');
			return;
		}

		if (
			noEntryRequired.length > 0 ||
			videoRequired.length > 0 ||
			followRequired.length > 0 ||
			winnerPromoCard.length > 0
		) {
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
				//Store that the giveaway has ended.
				await setProcessingCode(urlTypes.ENDED, currentGiveawayUrl);
				await page.goBack();
				return;
			}

			//check if already entered
			let isAlreadyEntered = await alreadyEntered(page);
			if (isAlreadyEntered) {
				console.log('giveaway ' + i + ' already entered.');
				//Store that the giveaway was already entered.
				await setProcessingCode(urlTypes.ALREADY, currentGiveawayUrl);
				await page.goBack();
				return;
			} else {
				console.log('giveaway ' + i + ' is ready!');
			}

			//check if price is greater than minimum
			let priceMatch = await hasCostGreaterThanMinimum(page);
			if (!priceMatch) {
				console.log(
					`giveaway ${i} price smaller than $${
						process.env.MINIMUM_PRICE
					}.`
				);
				await setProcessingCode(
					urlTypes.MINIMUM_PRICE,
					currentGiveawayUrl
				);
				await page.goBack();
				return;
			}

			//try to win!
			if (noEntryRequired.length > 0) {
				await enterNoEntryRequirementGiveaway(page);
			} else if (videoRequired.length > 0) {
				await enterVideoGiveaway(page);
			} else if (followRequired.length > 0) {
				await enterFollowGiveaway(page);
			} else if (winnerPromoCard.length > 0) {
				await enterWinnerPromoCardGiveaway(page);
			}

			//go back
			await page.goBack();
			await checkForSignInButton(page);
			await checkForSwitchAccount(page);
			await checkForPassword(page, pageNumber);
		} else {
			console.log('giveaway ' + i + ' cannot be entered.');
			//Giveaway cannot be entered
			await setProcessingCode(urlTypes.CANNOT, currentGiveawayUrl);
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
