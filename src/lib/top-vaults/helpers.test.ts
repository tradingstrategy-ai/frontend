import { describe, test, expect } from 'vitest';
import {
	isBlacklisted,
	hasSupportedProtocol,
	getProtocolDisplayName,
	isUnsupportedProtocolSlug,
	meetsMinTvl,
	getFormattedLockup,
	getFormattedFeeMode,
	getFeeModeLabel,
	getFeeModeDescription
} from './helpers';
import { createTestVault } from './test-utils';

describe('isBlacklisted', () => {
	test('returns true for blacklisted vaults', () => {
		const vault = createTestVault('Test vault', { risk: 'Blacklisted' });
		expect(vault.risk_numeric).toBe(999);
		expect(isBlacklisted(vault)).toBe(true);
	});

	test('returns false for non-blacklisted vaults', () => {
		const vault = createTestVault('Test vault', { risk: 'High' });
		expect(vault.risk_numeric).not.toBe(999);
		expect(isBlacklisted(vault)).toBe(false);
	});

	test('returns false for vaults with null risk', () => {
		const vault = createTestVault('Test vault');
		expect(vault.risk_numeric).toBeNull();
		expect(isBlacklisted(vault)).toBe(false);
	});
});

describe('hasSupportedProtocol', () => {
	test('returns true for supported protocols', () => {
		const vault = createTestVault('Test vault', { protocol: 'Yearn' });
		expect(hasSupportedProtocol(vault)).toBe(true);
	});

	test('returns false for unsupported protocols starting with <', () => {
		const vault = createTestVault('Test vault', { protocol: '<protocol not yet identified>' });
		expect(hasSupportedProtocol(vault)).toBe(false);
	});

	test('returns false for unsupported protocol slugs generated from placeholders', () => {
		const vault = {
			protocol: 'Yearn',
			protocol_slug: 'unknown-erc-7450'
		};
		expect(hasSupportedProtocol(vault)).toBe(false);
	});
});

describe('getProtocolDisplayName', () => {
	test('aliases unidentified protocol placeholder to Unknown', () => {
		expect(getProtocolDisplayName('<protocol not yet identified>')).toBe('Unknown');
	});

	test('returns the protocol name when it is supported', () => {
		expect(getProtocolDisplayName('Yearn')).toBe('Yearn');
	});
});

describe('isUnsupportedProtocolSlug', () => {
	test('matches the protocol not yet identified placeholder slug', () => {
		expect(isUnsupportedProtocolSlug('protocol-not-yet-identified')).toBe(true);
	});

	test('matches the unknown ERC-7450 placeholder slug', () => {
		expect(isUnsupportedProtocolSlug('unknown-erc-7450')).toBe(true);
	});

	test('ignores supported protocol slugs', () => {
		expect(isUnsupportedProtocolSlug('yearn')).toBe(false);
	});
});

describe('meetsMinTvl', () => {
	test('returns true when current_nav meets threshold', () => {
		const vault = createTestVault('Test vault', { current_nav: 50_000 });
		expect(meetsMinTvl(vault, 50_000)).toBe(true);
	});

	test('returns true when current_nav exceeds threshold', () => {
		const vault = createTestVault('Test vault', { current_nav: 100_000 });
		expect(meetsMinTvl(vault, 50_000)).toBe(true);
	});

	test('returns false when current_nav below threshold', () => {
		const vault = createTestVault('Test vault', { current_nav: 49_999 });
		expect(meetsMinTvl(vault, 50_000)).toBe(false);
	});

	test('returns false when current_nav is null', () => {
		const vault = createTestVault('Test vault', { current_nav: null });
		expect(meetsMinTvl(vault, 50_000)).toBe(false);
	});

	test('uses default threshold of 10,000', () => {
		const vaultBelow = createTestVault('Vault above', { current_nav: 9_999 });
		const vaultAbove = createTestVault('Vault below', { current_nav: 10_000 });
		expect(meetsMinTvl(vaultBelow)).toBe(false);
		expect(meetsMinTvl(vaultAbove)).toBe(true);
	});
});

describe('getFormattedLockup', () => {
	test('returns "No lockup" for 0 seconds', () => {
		const vault = createTestVault('Test vault', { lockup: 0 });
		expect(getFormattedLockup(vault)).toBe('No lockup');
	});

	test('returns "Unknown" for null lockup', () => {
		const vault = createTestVault('Test vault', { lockup: null });
		expect(getFormattedLockup(vault)).toBe('Unknown');
	});

	test('formats minutes correctly', () => {
		const vault = createTestVault('Test vault', { lockup: 300 }); // 5 minutes
		expect(getFormattedLockup(vault)).toBe('5m');
	});

	test('formats hours correctly', () => {
		const vault = createTestVault('Test vault', { lockup: 7200 }); // 2 hours
		expect(getFormattedLockup(vault)).toBe('2h');
	});

	test('formats days correctly', () => {
		const vault = createTestVault('Test vault', { lockup: 86400 }); // 1 day
		expect(getFormattedLockup(vault)).toBe('1d');
	});

	test('formats days and hours correctly', () => {
		const vault = createTestVault('Test vault', { lockup: 90000 }); // 1 day, 1 hour
		expect(getFormattedLockup(vault)).toBe('1d 1h');
	});

	test('uses abbreviated unit for 1 unit', () => {
		const vault = createTestVault('Test vault', { lockup: 60 }); // 1 minute
		expect(getFormattedLockup(vault)).toBe('1m');
	});
});

describe('getFormattedFeeMode', () => {
	test('returns "Unknown" for null fee_mode', () => {
		const vault = createTestVault('Test vault', { fee_mode: null });
		expect(getFormattedFeeMode(vault)).toBe('Unknown');
	});

	test('capitalises and replaces underscores', () => {
		const vault = createTestVault('Test vault', { fee_mode: 'internalised_minting' });
		expect(getFormattedFeeMode(vault)).toBe('Internalised minting');
	});

	test('handles feeless mode', () => {
		const vault = createTestVault('Test vault', { fee_mode: 'feeless' });
		expect(getFormattedFeeMode(vault)).toBe('Feeless');
	});
});

describe('getFeeModeLabel', () => {
	test('returns "Unknown" for null', () => {
		expect(getFeeModeLabel(null)).toBe('Unknown');
	});

	test('returns "Unknown" for undefined', () => {
		expect(getFeeModeLabel(undefined)).toBe('Unknown');
	});

	test('returns label for internalised_skimming', () => {
		expect(getFeeModeLabel('internalised_skimming')).toBe('Internalised (performance fee taken from closed positions)');
	});

	test('returns label for internalised_minting', () => {
		expect(getFeeModeLabel('internalised_minting')).toBe('Internalised minting');
	});

	test('returns label for externalised', () => {
		expect(getFeeModeLabel('externalised')).toBe('Externalised');
	});

	test('returns label for feeless', () => {
		expect(getFeeModeLabel('feeless')).toBe('Feeless');
	});
});

describe('getFeeModeDescription', () => {
	test('returns empty string for null', () => {
		expect(getFeeModeDescription(null)).toBe('');
	});

	test('returns empty string for undefined', () => {
		expect(getFeeModeDescription(undefined)).toBe('');
	});

	test('returns description for internalised_skimming', () => {
		expect(getFeeModeDescription('internalised_skimming')).toContain('deducted from closed trades');
	});

	test('returns description for internalised_minting', () => {
		expect(getFeeModeDescription('internalised_minting')).toContain('minting additional vault shares');
	});

	test('returns description for externalised', () => {
		expect(getFeeModeDescription('externalised')).toContain('charged separately');
	});

	test('returns description for feeless', () => {
		expect(getFeeModeDescription('feeless')).toContain('No fees');
	});
});
