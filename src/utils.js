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

module.exports = {
	asyncForEach
};

/**
 * The callback that will be called with each value in array
 * @callback utils~asyncForEachCallback
 * @param {*} value
 * @param {number} index
 * @param {Array} array
 */
