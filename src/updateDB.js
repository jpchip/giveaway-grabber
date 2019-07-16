const sqlite = require('./database');

//A common location for performing DB upgrades
async function updateDB() {
	let version = -1;
	let response = null;
	try {
		response = await sqlite.run(
			'CREATE TABLE version(vers integer NOT NULL PRIMARY KEY)'
		);
		if (response) {
			console.log('Table created');
		}
	} catch (error) {
		//Do nothing.
	}

	response = await sqlite.get('SELECT vers FROM version');
	if (typeof response === 'undefined') {
		const pRet = await sqlite.run('INSERT INTO version (vers) VALUES (0)');
		if (pRet) {
			console.log('Version initialized to 0');
			version = 0;
		}
	} else {
		version = response.vers;
	}

	if (version === 0) {
		let pRet = sqlite.run(
			'CREATE TABLE GG_DATA(sweepURL VARCHAR(100) NOT NULL PRIMARY KEY, ' +
				'processCode VARCHAR(1), ' +
				'dateChecked TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)'
		);
		if (pRet) {
			console.log('Created URL Table');
		}
		pRet = sqlite.run('UPDATE version set vers = 1');
		if (pRet) {
			console.log('Set DB Version to 1');
			version = 1;
		}
	}
}

module.exports = {
	updateDB
};
