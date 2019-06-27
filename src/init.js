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
					name: 'remember_me',
					message: 'Stay logged in',
					type: 'confirm',
					default: false
				},
				{
					name: 'sendgrid_api_key',
					message: 'Sendgrid API Key (optional, for emails on win):',
					default: ''
				},
				{
					name: 'blacklist',
					message: 'Black List (optional, comma separated list)',
					type: 'input',
					default: ''
				},
				{
					name: 'minimum_price',
					message: 'Minimum item value (optional, default $0)',
					type: 'input',
					default: 0
				},
				{
					name: 'follow_giveaway',
					message: 'Enter Follow type giveaways (optional)',
					type: 'confirm',
					default: false
				},
				{
					name: 'unfollow_updates',
					message: 'Unfollow updates from follow type giveaways',
					type: 'confirm',
					default: false
				}
			])
			.then(answers => {
				answers.sendgrid_cc = '';
				answers.chromeExecutablePath = '';
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
