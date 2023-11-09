import { parseDate } from './date';

describe('parseDate', () => {
	const expectedDate = new Date('2022-12-02T16:53Z');

	test('should parse ISO date string', () => {
		expect(parseDate('2022-12-02T16:53Z')).toEqual(expectedDate);
	});

	test('should parse ISO-like date string missing tz offset', () => {
		expect(parseDate('2022-12-02T16:53')).toEqual(expectedDate);
		expect(parseDate('2022-12-02T16:53:00')).toEqual(expectedDate);
		expect(parseDate('2022-12-02T16:53:00.000')).toEqual(expectedDate);
	});

	test('should parse JS-style numeric date value', () => {
		expect(parseDate(1669999980000)).toEqual(expectedDate);
	});

	test('should parse JS-style numeric value provided as string', () => {
		expect(parseDate('1669999980000')).toEqual(expectedDate);
	});

	test('should parse unix epoch numeric value', () => {
		expect(parseDate(1669999980)).toEqual(expectedDate);
	});

	test('should parse unix epoch string value', () => {
		expect(parseDate(1669999980)).toEqual(expectedDate);
	});
});
