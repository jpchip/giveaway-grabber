const {checkStringForWords} = require('./utils');

describe('checkStringForWords', () => {
	test('matches whole words in string', () => {
		const match = checkStringForWords('cat', 'I bought the cat some food.');
		expect(match).toEqual('cat');
	});

	test('does not match partial words in string', () => {
		const match = checkStringForWords('cat', 'That was a categorically good vacation!');
		expect(match).toBeNull();
	});

	test('matches words when multiple are given', () => {
		const match = checkStringForWords('cat, dog ,frog', 'The dog ran fast.');
		expect(match).toEqual('dog');
	});

	test('matches words with spaces in them', () => {
		let match = checkStringForWords('kindle edition,something', 'I bought the Kindle Edition for xmas');
		expect(match).toEqual('kindle edition');
		match = checkStringForWords('dog,bought the', 'I bought the Kindle Edition for xmas');
		expect(match).toEqual('bought the');
	});

	test('returns null when no words are given', () => {
		let match = checkStringForWords('', 'I bought the Kindle Edition for xmas');
		expect(match).toBeNull();
		match = checkStringForWords(undefined, 'I bought the Kindle Edition for xmas');
		expect(match).toBeNull();
		match = checkStringForWords(['for'], 'I bought the Kindle Edition for xmas');
		expect(match).toBeNull();
		match = checkStringForWords(', , ', 'I bought the Kindle Edition for xmas');
		expect(match).toBeNull();
	});

	test('returns null if string is not a string', () => {
		let match = checkStringForWords('55', 55);
		expect(match).toBeNull();
		match = checkStringForWords(null, null);
		expect(match).toBeNull();
	});
});

