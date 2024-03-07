import { isGeoBlocked } from './geo';

// see src/lib/__mocks__/config.ts for mock config data
describe('isGeoBlocked', () => {
	test('should return true for country in feature blocklist', () => {
		expect(isGeoBlocked('strategies:view', 'RU')).toBe(true);
	});

	test('should return false for country not in feature blocklist', () => {
		expect(isGeoBlocked('strategies:view', 'US')).toBe(false);
	});

	test('should return false for undefined country', () => {
		expect(isGeoBlocked('strategies:view', undefined)).toBe(false);
	});

	test('should return false for feature not in blocklist', () => {
		expect(isGeoBlocked('foo:bar', 'US')).toBe(false);
	});
});
