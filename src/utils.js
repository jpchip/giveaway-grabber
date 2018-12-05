/**
 * Foreach loop for async functions
 * @param {Array} array
 * @param {} callback
 * @returns {Promise<void>}
 */
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

module.exports = {
	asyncForEach
};

/**
 * Callback function for asyncForEach
 */
