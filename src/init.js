const inquirer = require('inquirer');
const fs = require('fs');

exports.command = 'init';

exports.describe = 'Setup wizard for creating config file';

exports.handler = function(argv) {
	console.log('handler');
	(async function() {
		inquirer
			.prompt([
				{
					name: 'username',
					message: 'Amazon User Email Address:'
				},
				{
					name: 'password',
					message: 'Amazon User Password:',
					type: 'password'
				},
				{
					name: '2FA',
					message: 'Two Factor Authentication',
					type: 'confirm',
					default: false
				},
				{
					name: 'sendgrid_api_key',
					message: 'Sendgrid API Key (for emails on win):',
					default: ''
				},
				{
					name: 'blacklist',
					message: 'Black List (comma separated list)',
					type: 'input',
					default: ''
				}
			])
			.then(answers => {
				answers.sendgrid_cc = '';
				fs.writeFile(
					'./.ggrc.json',
					JSON.stringify(answers, null, 2),
					function(err) {
						if (err) {
							return console.log(err);
						}
						console.log('Config file created.');
					}
				);
			});
	})().then();
};
