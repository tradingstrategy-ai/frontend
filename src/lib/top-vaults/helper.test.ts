import { getFormattedLockup } from './helpers';
import type { VaultInfo } from './schemas';

describe('getFormattedLockup', () => {
	let vault: VaultInfo;

	beforeEach(() => {
		vault = {} as VaultInfo;
	});

	test('should return "Unknown" for null lockup', () => {
		vault.lockup = null;
		expect(getFormattedLockup(vault)).toBe('Unknown');
	});

	test('should return "No lockup" for zero or very small lockup', () => {
		vault.lockup = 0;
		expect(getFormattedLockup(vault)).toBe('No lockup');

		vault.lockup = 59;
		expect(getFormattedLockup(vault)).toBe('No lockup');
	});

	test('should include minutes if under 1 hour', () => {
		vault.lockup = 1800; // 30 minutes
		expect(getFormattedLockup(vault)).toBe('30m');
	});

	test('should include hours if under 1 day', () => {
		vault.lockup = 43200; // 12 hours
		expect(getFormattedLockup(vault)).toBe('12h');
	});

	test('should include days only when no remainder hours', () => {
		vault.lockup = 604800; // 7 days
		expect(getFormattedLockup(vault)).toBe('7d');
	});

	test('should include both days and hours when applicable', () => {
		vault.lockup = 216000; // 2 days, 12 hours
		expect(getFormattedLockup(vault)).toBe('2d 12h');
	});

	test('should use abbreviated units', () => {
		vault.lockup = 60; // 1 minute
		expect(getFormattedLockup(vault)).toBe('1m');

		vault.lockup = 86400; // 1 day
		expect(getFormattedLockup(vault)).toBe('1d');
	});
});
