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

module.exports = {
	asyncForEach,
	sendSystemNotification
};

/**
 * The callback that will be called with each value in array
 * @callback utils~asyncForEachCallback
 * @param {*} value
 * @param {number} index
 * @param {Array} array
 */
