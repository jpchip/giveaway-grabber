const rewire = require('rewire');
const giveaways = rewire('./giveaways');
const sqlite = require('./database');

jest.mock('./database.js');
giveaways.__set__('sqlite', sqlite);
sqlite.run.mockReturnValue(Promise.resolve(true));

describe('handleGiveawayResult', () => {
	const handleGiveawayResult = giveaways.__get__('handleGiveawayResult');
	giveaways.__set__('currentGiveawayUrl', 'http://www.example.com');

	describe('if cannot find entry', () => {
		it('should return false if cannot find element', async () => {
			const page = {
				waitForSelector: jest.fn().mockReturnValue(false)
			};
			expect(await handleGiveawayResult(page)).toEqual(false);
		});

		it('should return false if evaluate fails', async () => {
			const page = {
				waitForSelector: jest.fn().mockReturnValue(true),
				evaluate: jest.fn().mockReturnValue(undefined)
			};
			expect(await handleGiveawayResult(page)).toEqual(false);
		});
	});

	describe('on winning entry', () => {
		it('should return true', async () => {
			const page = {
				waitForSelector: jest.fn().mockReturnValue(true),
				evaluate: jest.fn().mockReturnValue('Jared, you won!'),
				url: jest.fn().mockReturnValue('http://www.example.com')
			};
			expect(await handleGiveawayResult(page)).toEqual(true);
		});
	});
});
