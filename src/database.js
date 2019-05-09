//Code borrowed from example found at https://www.scriptol.com/sql/sqlite-async-await.php
const sqlite3 = require('sqlite3').verbose();
var db;

exports.db = db;

/**
 * Creates or opens existing database.
 * @param path Database location
 * @returns {Promise<void>}
 */
exports.open = function(path) {
	return new Promise(function(resolve) {
		this.db = new sqlite3.Database(path, function(err) {
			if (err) reject('Open error: ' + err.message);
			else resolve(path + ' opened');
		});
	});
};

/**
 * Used for insert, delete, or update queries.
 * @param query Query that should be executed.
 * @returns {Promise<void>}
 */
exports.run = function(query) {
	return new Promise(function(resolve, reject) {
		this.db.run(query, function(err) {
			if (err) reject(err.message);
			else resolve(true);
		});
	});
};

/**
 * Read the first row from a Select query.
 * @param query The select statement that should be processed.
 * @returns {Promise<void>}
 */
exports.get = function(query, params) {
	return new Promise(function(resolve, reject) {
		this.db.get(query, params, function(err, row) {
			if (err) reject('Read error: ' + err.message);
			else {
				resolve(row);
			}
		});
	});
};

/**
 * Read all rows that match the query.
 * @param query Query that should be executed.
 * @param params Array of parameters to be used with supplied query.
 * @returns {Promise<void>}
 */
exports.all = function(query, params) {
	return new Promise(function(resolve, reject) {
		if (params == undefined) params = [];

		this.db.all(query, params, function(err, rows) {
			if (err) reject('Read error: ' + err.message);
			else {
				resolve(rows);
			}
		});
	});
};

/**
 * Each row returned one by one
 * @param query Query that should be executed.
 * @param params Array of parameters to be used with supplied query.
 * @param action Call back function used to process results.
 * @returns {Promise<void>}
 */
exports.each = function(query, params, action) {
	return new Promise(function(resolve, reject) {
		var db = this.db;
		db.serialize(function() {
			db.each(query, params, function(err, row) {
				if (err) reject('Read error: ' + err.message);
				else {
					if (row) {
						action(row);
					}
				}
			});
			db.get('', function(err, row) {
				resolve(true);
			});
		});
	});
};

exports.close = function() {
	return new Promise(function(resolve, reject) {
		this.db.close();
		resolve(true);
	});
};
