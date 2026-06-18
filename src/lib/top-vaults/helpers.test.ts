import { describe, test, expect } from 'vitest';
import {
	CORE3_METHODOLOGY_URL,
	isBlacklisted,
	hasSupportedProtocol,
	getProtocolDisplayName,
	isUnsupportedProtocolSlug,
	meetsMinTvl,
	getFormattedLockup,
	getFormattedFeeMode,
	getFeeModeLabel,
	getFeeModeDescription,
	getCore3PolForVault,
	getCore3ProtocolForVault,
	getCore3ReportUrl,
	getCore3RankingUrl,
	getCore3ScoreTone,
	getCore3CategoryScores
} from './helpers';
import type { Core3Protocol } from './schemas';
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
		expect(getFormattedLockup(vault)).toBe('Instant');
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

describe('getCore3ReportUrl', () => {
	test('exposes the tracked project methodology URL', () => {
		expect(CORE3_METHODOLOGY_URL).toBe(
			'https://core3.io/methodology/projects?utm_source=tradingstrategy&utm_medium=partner&utm_campaign=integration'
		);
	});

	test('builds the project profile URL from the CORE3 slug with the UTM source', () => {
		expect(getCore3ReportUrl({ slug: 'sky' })).toBe('https://core3.io/projects/sky?utm_source=tradingstrategy');
	});

	test('returns undefined when the slug is missing', () => {
		expect(getCore3ReportUrl({ slug: '' })).toBeUndefined();
	});
});

describe('getCore3RankingUrl', () => {
	test('returns the projects ranking URL with the UTM source for non-exchange categories', () => {
		expect(getCore3RankingUrl({ category: { name: 'Decentralized Finance' } })).toBe(
			'https://core3.io/ratings/projects?utm_source=tradingstrategy'
		);
	});

	test('returns the exchanges ranking URL for exchange categories', () => {
		expect(getCore3RankingUrl({ category: { name: 'Decentralized Exchange' } })).toBe(
			'https://core3.io/ratings/exchanges?utm_source=tradingstrategy'
		);
	});

	test('defaults to the projects ranking when category is missing', () => {
		expect(getCore3RankingUrl({})).toBe('https://core3.io/ratings/projects?utm_source=tradingstrategy');
	});
});

describe('getCore3PolForVault', () => {
	test('prefers the full top-level protocol record', () => {
		const vault = createTestVault('Test vault', {
			protocol: 'Morpho',
			core3: {
				risk_score: 42,
				risk_rating_label: 'CCC',
				confidence: 'Low'
			}
		});
		const protocols: Record<string, Core3Protocol> = {
			morpho: {
				slug: 'morpho',
				name: 'Morpho',
				pol: {
					score: 22.16,
					rating: 'BBB',
					confidence: 'High'
				}
			}
		};

		expect(getCore3PolForVault(vault, protocols)).toEqual({
			score: 22.16,
			rating: 'BBB',
			confidence: 'High'
		});
	});

	test('falls back to compact per-vault Core3 data', () => {
		const vault = createTestVault('Test vault', {
			protocol: 'Morpho',
			core3: {
				risk_score: 22.16,
				risk_rating_label: 'BBB',
				confidence: 'High'
			}
		});

		expect(getCore3PolForVault(vault, {})).toEqual({
			score: 22.16,
			rating: 'BBB',
			confidence: 'High'
		});
	});

	test('returns null when neither Core3 shape has headline data', () => {
		const vault = createTestVault('Test vault', { protocol: 'Morpho' });

		expect(getCore3PolForVault(vault, {})).toBeNull();
	});
});

describe('getCore3ProtocolForVault', () => {
	test('adapts compact per-vault Core3 data for display components', () => {
		const vault = createTestVault('Test vault', {
			protocol: 'Morpho',
			core3: {
				risk_score: 22.16,
				risk_rating_label: 'BBB',
				confidence: 'High',
				core3_ranking: 39,
				data_coverage: 76.7,
				market_cap: 1_253_724_481
			}
		});

		expect(getCore3ProtocolForVault(vault, {})).toEqual({
			slug: '',
			name: 'Morpho',
			rank: 39,
			pol: {
				score: 22.16,
				rating: 'BBB',
				confidence: 'High'
			},
			data_coverage: { percentage: 76.7 },
			market_cap: { in_usd: '1253724481' }
		});
	});

	test('falls back to compact per-vault data when top-level protocol pol is null', () => {
		const vault = createTestVault('Test vault', {
			protocol: 'Morpho',
			core3: {
				risk_score: 22.16,
				risk_rating_label: 'BBB',
				confidence: 'High'
			}
		});
		const protocols: Record<string, Core3Protocol> = {
			morpho: {
				slug: 'morpho-core3',
				name: 'Morpho',
				pol: null
			}
		};

		expect(getCore3ProtocolForVault(vault, protocols)?.pol).toEqual({
			score: 22.16,
			rating: 'BBB',
			confidence: 'High'
		});
		expect(getCore3ProtocolForVault(vault, protocols)?.slug).toBe('');
	});
});

describe('getCore3ScoreTone', () => {
	test('maps risk sub-scores to grade tones (lower is better)', () => {
		expect(getCore3ScoreTone(0)).toBe('excellent');
		expect(getCore3ScoreTone(29.9)).toBe('excellent');
		expect(getCore3ScoreTone(30)).toBe('good');
		expect(getCore3ScoreTone(49.9)).toBe('good');
		expect(getCore3ScoreTone(50)).toBe('fair');
		expect(getCore3ScoreTone(69.9)).toBe('fair');
		expect(getCore3ScoreTone(70)).toBe('poor');
		expect(getCore3ScoreTone(100)).toBe('poor');
	});

	test('returns "unknown" when the score is missing', () => {
		expect(getCore3ScoreTone(null)).toBe('unknown');
		expect(getCore3ScoreTone(undefined)).toBe('unknown');
	});
});

describe('getCore3CategoryScores', () => {
	test('flattens pol_categories into an ordered, display-ready list', () => {
		const result = getCore3CategoryScores({
			pol_categories: {
				security: 50.98,
				financial: 56.67,
				operational: 21.67,
				reputational: 56.34,
				regulatory: 50
			}
		});

		expect(result.map((c) => c.key)).toEqual(['security', 'financial', 'operational', 'reputational', 'regulatory']);
		expect(result[0]).toEqual({ key: 'security', label: 'Security', score: 50.98, tone: 'fair' });
		expect(result[2]).toEqual({
			key: 'operational',
			label: 'Operational',
			score: 21.67,
			tone: 'excellent'
		});
	});

	test('drops categories with no score', () => {
		const result = getCore3CategoryScores({
			pol_categories: { security: 28.58, financial: null, operational: undefined, regulatory: 24 }
		});

		expect(result.map((c) => c.key)).toEqual(['security', 'regulatory']);
	});

	test('returns an empty array when there is no per-category breakdown', () => {
		expect(getCore3CategoryScores({})).toEqual([]);
		expect(getCore3CategoryScores({ pol_categories: null })).toEqual([]);
	});
});
