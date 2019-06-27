const Tesseract = require('tesseract.js');
const { sendSystemNotification } = require('./utils');

/**
 * Goes to Amazon Sign In page and tries to sign in with given credentials
 * @param {Puppeteer.Page} page
 * @param {string} username
 * @param {string} password
 * @param {number} pageNumber
 * @param {boolean} twoFactorAuth
 * @param {boolean} rememberMe
 * @returns {Promise<void>}
 */
module.exports = async function(
	page,
	username,
	password,
	pageNumber,
	twoFactorAuth,
	rememberMe
) {
	const returnUrl = encodeURIComponent(
		'https://www.amazon.com/ga/giveaways?pageId=' + pageNumber
	);
	await page.goto(
		'https://www.amazon.com/ap/signin?_encoding=UTF8&ignoreAuthState=1&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=' +
			returnUrl +
			'&switch_account='
	);

	try {
		await page.waitForSelector('#ap_email', {
			timeout: 1000
		});
		await page.click('#ap_email');
		await page.type('#ap_email', username);
	} catch (error) {
		console.log('No email field');
	}

	await page.waitForSelector('#ap_password');
	await page.click('#ap_password');
	await page.type('#ap_password', password);

	if (rememberMe) {
		try {
			await page.waitForSelector('[name=rememberMe]', {
				timeout: 1000
			});
			await page.click('[name=rememberMe]');
		} catch (error) {
			// couldn't click rememberMe, no big deal
		}
	}

	const signInPromise = page.waitForNavigation();
	await page.waitForSelector('#signInSubmit');
	await page.click('#signInSubmit');
	await signInPromise;

	await checkForCaptcha(page, password);

	if (twoFactorAuth) {
		try {
			await page.waitForSelector('#auth-mfa-otpcode', {
				timeout: 1000
			});
			if (rememberMe) {
				await page.waitForSelector('#auth-mfa-remember-device', {
					timeout: 1000
				});
				await page.click('#auth-mfa-remember-device');
			}
			console.log('Waiting for two factor authentication...');
			const twoFactorAuthPromise = page.waitForNavigation({ timeout: 0 });
			await twoFactorAuthPromise;
		} catch (error) {
			//couldn't click remember device, no big deal
		}
	}
};

/**
 * Check if there's a captcha, tries to guess it.
 * Then re-enters password and waits for user to verify captcha guess
 * and click the sign in button themselves.
 * @param {Puppeteer.Page} page
 * @param {string} password
 * @returns {Promise<void>}
 */
async function checkForCaptcha(page, password) {
	console.log('checkForCaptcha');
	try {
		await page.waitForSelector('#auth-captcha-image', { timeout: 500 });
		const url = await page.$eval(
			'img[src*="opfcaptcha-prod"]',
			el => el.src
		);

		const tessValue = await Tesseract.recognize(url).then(function(result) {
			return result;
		});
		console.log('OCR Value:  ' + tessValue.text.trim().replace(' ', ''));
		await page.waitForSelector('#auth-captcha-guess');
		await page.click('#auth-captcha-guess');
		await page.type(
			'#auth-captcha-guess',
			tessValue.text.trim().replace(' ', '')
		);

		//enter password again...
		await page.waitForSelector('#ap_password');
		await page.click('#ap_password');
		await page.type('#ap_password', password);

		const message = 'ENTER CAPTCHA!';
		console.log(message);
		const notification = {
			title: 'giveaway-grabber',
			message: message
		};
		sendSystemNotification(notification);

		await page.waitFor(
			() => !document.querySelector('#auth-captcha-image'),
			{
				timeout: 0
			}
		);
	} catch (error) {
		//nothing to do here...
		//console.log(error);
	}
}
