//Code borrowed from example found at https://www.scriptol.com/sql/sqlite-async-await.php
const sqlite3 = require('sqlite3').verbose();
let db;

/**
 * Creates or opens existing database.
 * @param {string} Database location
 * @returns {Promise<string>}
 */
const open = path =>
	new Promise((resolve, reject) => {
		db = new sqlite3.Database(path, err => {
			if (err) reject('Open error: ' + err.message);
			else resolve(path + ' opened');
		});
	});

/**
 * Used for insert, delete, or update queries.
 * @param {string} query that should be executed.
 * @param {Array} params array of parameters of the query.
 * @returns {Promise<boolean>}
 */
const run = (query, params) =>
	new Promise((resolve, reject) => {
		db.run(query, params, err => {
			if (err) reject(err.message);
			else resolve(true);
		});
	});

/**
 * Read the first row from a Select query.
 * @param {string} query The select statement that should be processed.
 * @param {Array} params Array of parameters of the query.
 * @returns {Promise<void>}
 */
const get = (query, params) =>
	new Promise((resolve, reject) => {
		db.get(query, params, (err, row) => {
			if (err) reject('Read error: ' + err.message);
			else {
				resolve(row);
			}
		});
	});

/**
 * Read all rows that match the query.
 * @param {string} query that should be executed.
 * @param {array} [params] array of parameters to be used with supplied query.
 * @returns {Promise<void>}
 */
const all = (query, params) =>
	new Promise((resolve, reject) => {
		if (params === undefined) params = [];

		db.all(query, params, (err, rows) => {
			if (err) reject('Read error: ' + err.message);
			else {
				resolve(rows);
			}
		});
	});

/**
 * @callback actionCallback
 * @param  {Array} row
 */

/**
 * Each row returned one by one
 * @param {string} query Query that should be executed.
 * @param {Array} params Array of parameters to be used with supplied query.
 * @param {actionCallback} action Call back function used to process results.
 * @returns {Promise<void>}
 */
const each = (query, params, action) =>
	new Promise((resolve, reject) => {
		db.serialize(() => {
			db.each(query, params, (err, row) => {
				if (err) reject('Read error: ' + err.message);
				else if (row) {
					action(row);
				}
			});
			db.get('', () => {
				resolve(true);
			});
		});
	});

/**
 * Closes existing database.
 * @returns {Promise<boolean>}
 */
const close = () =>
	new Promise(resolve => {
		db.close();
		resolve(true);
	});

module.exports = {
	db,
	open,
	run,
	get,
	all,
	each,
	close
};
