const nn = require('node-notifier');

/**
 * Foreach loop for async functions
 * @param {Array} array
 * @param {utils~asyncForEachCallback} callback
 * @returns {Promise<void>}
 */
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

/**
 * @typedef {Object} Notification
 * @property {string} title
 * @property {string} message
 */

/**
 * Sends system notification
 * @param {Notification} notification
 */
function sendSystemNotification(notification) {
	new nn.NotificationCenter().notify(notification);
	new nn.NotifySend().notify(notification);
	new nn.WindowsToaster().notify(notification);
	//new nn.WindowsBalloon().notify(notification);
	new nn.Growl().notify(notification);
}

/**
 * Checks if str contains one of a
 * comma delimited lists of words
 * @param {string} wordList
 * @param {string} str
 * @return {string|null}
 */
function checkStringForWords(wordList, str) {
	let match = null;
	if (typeof wordList !== 'string' || typeof str !== 'string') {
		return null;
	}
	const words = String(wordList)
		.toLowerCase()
		.split(',');
	words.forEach(word => {
		const wordTrimmed = word.trim();
		if (wordTrimmed === '' || match !== null) {
			return;
		}
		if (
			str.toLowerCase().includes(wordTrimmed) &&
			new RegExp('\\b' + wordTrimmed + '\\b').test(str.toLowerCase())
		) {
			match = wordTrimmed;
		}
	});
	return match;
}

module.exports = {
	asyncForEach,
	sendSystemNotification,
	checkStringForWords
};

/**
 * The callback that will be called with each value in array
 * @callback utils~asyncForEachCallback
 * @param {*} value
 * @param {number} index
 * @param {Array} array
 */
