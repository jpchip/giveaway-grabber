const yargs = require('yargs');

describe('init command', () => {
	it("returns help output", async () => {
		// Initialize parser using the command module
		const parser = yargs.command(require('./init')).help();

		// Run the command module with --help as argument
		const output = await new Promise((resolve) => {
			parser.parse("--help", (err, argv, output) => {
				resolve(output);
			})
		});

		// Verify the output is correct
		expect(output).toBe(expect.stringContaining("Setup wizard for creating config file"));
	});
});
