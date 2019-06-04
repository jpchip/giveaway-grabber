//Code borrowed from example found at https://www.scriptol.com/sql/sqlite-async-await.php
const sqlite3 = require('sqlite3').verbose();
var db;

/**
 * Creates or opens existing database.
 * @param path Database location
 * @returns {Promise<string>}
 */
const open = path =>
	new Promise(resolve => {
		this.db = new sqlite3.Database(path, err => {
			if (err) reject('Open error: ' + err.message);
			else resolve(path + ' opened');
		});
	});

/**
 * Used for insert, delete, or update queries.
 * @param query Query that should be executed.
 * @param params Array of paramaters of the query.
 * @returns {Promise<void>}
 */
const run = (query, params) =>
	new Promise((resolve, reject) => {
		this.db.run(query, params, err => {
			if (err) reject(err.message);
			else resolve(true);
		});
	});

/**
 * Read the first row from a Select query.
 * @param query The select statement that should be processed.
 * @returns {Promise<void>}
 */
const get = (query, params) =>
	new Promise((resolve, reject) => {
		this.db.get(query, params, (err, row) => {
			if (err) reject('Read error: ' + err.message);
			else {
				resolve(row);
			}
		});
	});

/**
 * Read all rows that match the query.
 * @param query Query that should be executed.
 * @param params Array of parameters to be used with supplied query.
 * @returns {Promise<void>}
 */
const all = (query, params) =>
	new Promise((resolve, reject) => {
		if (params == undefined) params = [];

		this.db.all(query, params, (err, rows) => {
			if (err) reject('Read error: ' + err.message);
			else {
				resolve(rows);
			}
		});
	});

/**
 * Each row returned one by one
 * @param query Query that should be executed.
 * @param params Array of parameters to be used with supplied query.
 * @param action Call back function used to process results.
 * @returns {Promise<void>}
 */
const each = (query, params, action) =>
	new Promise((resolve, reject) => {
		var db = this.db;
		db.serialize(() => {
			db.each(query, params, (err, row) => {
				if (err) reject('Read error: ' + err.message);
				else {
					if (row) {
						action(row);
					}
				}
			});
			db.get('', (err, row) => {
				resolve(true);
			});
		});
	});

/**
 * Closes existing database.
 * @param path Database location
 * @returns {Promise<void>}
 */
const close = () =>
	new Promise((resolve, reject) => {
		this.db.close();
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
