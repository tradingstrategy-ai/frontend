import { describe, test, expect } from 'vitest';
import {
	CORE3_METHODOLOGY_URL,
	isBlacklisted,
	isEligibleFrontpageVault,
	hasSupportedProtocol,
	getProtocolDisplayName,
	isUnknownVaultProtocol,
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
	getCore3CategoryScores,
	getCurrencyUsdRates,
	getVaultCurrentTvlUsd,
	getVaultDenominationCurrency,
	getVaultDenominationUsdRate,
	getVaultPeakTvlUsd,
	getVaultTvlNative,
	isNonUsdDenominatedVault,
	normaliseKinexysVaultDenomination,
	normaliseVaultProtocolDisplayName,
	withVaultCurrentTvlUsd,
	withVaultDenominationTokenRate,
	calculateTotalTvl,
	calculateTvlWeightedApy
} from './helpers';
import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
import type { Core3Protocol, DenominationTokenRate } from './schemas';
import { createTestVault } from './test-utils';

function createDenominationTokenRate(overrides: Partial<DenominationTokenRate> = {}): DenominationTokenRate {
	return {
		coingecko_id: null,
		source_currency: null,
		usd_rate: null,
		usd_rate_fetched_at: null,
		usd_rate_source: null,
		native_rate: null,
		native_rate_currency: null,
		native_rate_fetched_at: null,
		native_rate_source: null,
		source_currency_usd_rate: null,
		source_currency_usd_rate_fetched_at: null,
		source_currency_usd_rate_source: null,
		...overrides
	};
}

function createStablecoinMetadata(overrides: Partial<StablecoinMetadata> = {}): StablecoinMetadata {
	return {
		symbol: 'EURA',
		slug: 'eura',
		name: 'Angle EURA',
		short_description: 'Euro stablecoin',
		description: 'Euro stablecoin',
		category: 'stablecoin',
		links: { homepage: null, coingecko: null, defillama: null, twitter: null },
		logos: { light: null },
		...overrides
	};
}

describe('isBlacklisted', () => {
	test('returns true for blacklisted vaults', () => {
		const vault = createTestVault('Test vault', { risk: 'Blacklisted' });
		expect(vault.risk_numeric).toBe(999);
		expect(isBlacklisted(vault)).toBe(true);
	});

	test('returns true when only the risk label is blacklisted', () => {
		const vault = createTestVault('Test vault', { risk: 'High' });
		expect(isBlacklisted({ ...vault, risk: 'Blacklisted', risk_numeric: null })).toBe(true);
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

describe('normaliseKinexysVaultDenomination', () => {
	test('uses off-chain USD dollars for Kinexys vault denomination', () => {
		const vault = createTestVault('JPMorgan OnChain Liquidity-Token Money Market Fund', {
			protocol: 'Kinexys',
			denomination: 'USDC',
			normalised_denomination: 'Circle USDC',
			denomination_slug: 'usdc',
			denomination_token_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
			denomination_token_rate: createDenominationTokenRate({ usd_rate: 0.999897 })
		});

		const normalised = normaliseKinexysVaultDenomination(vault);

		expect(normalised.denomination).toBe('USD (offchain)');
		expect(normalised.normalised_denomination).toBe('USD (offchain)');
		expect(normalised.denomination_slug).toBe('usd-offchain');
		expect(normalised.denomination_token_address).toBeNull();
		expect(normalised.denomination_token_rate).toBeNull();
	});

	test('does not change non-Kinexys vaults', () => {
		const vault = createTestVault('Aave USDC', { protocol: 'Aave V3' });

		expect(normaliseKinexysVaultDenomination(vault)).toBe(vault);
	});
});

describe('calculateTvlWeightedApy', () => {
	test('excludes blacklisted vaults from the weighted average', () => {
		const included = createTestVault('Included vault', {
			current_nav: 100_000,
			one_month_cagr: 0.1
		});
		const blacklisted = createTestVault('Blacklisted vault', {
			current_nav: 900_000,
			one_month_cagr: 1,
			risk: 'Blacklisted'
		});

		expect(calculateTvlWeightedApy([included, blacklisted])).toBe(0.1);
	});

	test('excludes label-only blacklisted vaults from the weighted average', () => {
		const included = createTestVault('Included vault', {
			current_nav: 100_000,
			one_month_cagr: 0.1
		});
		const blacklisted = {
			...createTestVault('Blacklisted label vault', {
				current_nav: 900_000,
				one_month_cagr: 1,
				risk: 'High'
			}),
			risk: 'Blacklisted',
			risk_numeric: null
		};

		expect(calculateTvlWeightedApy([included, blacklisted])).toBe(0.1);
	});

	test('includes blacklisted vaults when requested', () => {
		const included = createTestVault('Included vault', {
			current_nav: 100_000,
			one_month_cagr: 0.1
		});
		const blacklisted = createTestVault('Blacklisted vault', {
			current_nav: 300_000,
			one_month_cagr: 0.5,
			risk: 'Blacklisted'
		});

		expect(calculateTvlWeightedApy([included, blacklisted], { includeBlacklisted: true })).toBe(0.4);
	});

	test('excludes vaults above the max TVL from the weighted average', () => {
		const included = createTestVault('Included vault', {
			current_nav: 100_000,
			one_month_cagr: 0.1
		});
		const abnormal = createTestVault('Abnormal TVL vault', {
			current_nav: 2_000_000_000,
			one_month_cagr: 1
		});

		expect(calculateTvlWeightedApy([included, abnormal], { maxTvlUsd: 1_000_000_000 })).toBe(0.1);
	});
});

describe('calculateTotalTvl', () => {
	test('excludes non-finite and above-threshold TVL values when requested', () => {
		expect(
			calculateTotalTvl(
				[{ current_nav: 100_000 }, { current_nav: 2_000_000_000 }, { current_nav: Number.POSITIVE_INFINITY }],
				{ maxTvlUsd: 1_000_000_000 }
			)
		).toBe(100_000);
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

	test('returns false for empty protocols', () => {
		const vault = createTestVault('Test vault', { protocol: ' ' });
		expect(hasSupportedProtocol(vault)).toBe(false);
	});

	test('returns false for unsupported protocol slugs generated from placeholders', () => {
		const vault = {
			protocol: 'Yearn',
			protocol_slug: 'unknown-erc-7450'
		};
		expect(hasSupportedProtocol(vault)).toBe(false);
	});

	test('returns false for manually mapped unknown protocol slugs', () => {
		const vault = {
			protocol: 'Unknown vault protocol',
			protocol_slug: 'erc-4626'
		};
		expect(hasSupportedProtocol(vault)).toBe(false);
	});
});

describe('isEligibleFrontpageVault', () => {
	test('returns true for known protocol vaults with severe risk or safer', () => {
		const vault = createTestVault('Test vault', { protocol: 'Yearn', risk: 'Severe' });
		expect(isEligibleFrontpageVault(vault)).toBe(true);
	});

	test('returns false for dangerous risk vaults', () => {
		const vault = createTestVault('Test vault', { protocol: 'Yearn', risk: 'Dangerous' });
		expect(isEligibleFrontpageVault(vault)).toBe(false);
	});

	test('returns false for unknown risk vaults', () => {
		const vault = createTestVault('Test vault', { protocol: 'Yearn' });
		expect(isEligibleFrontpageVault(vault)).toBe(false);
	});

	test('returns false for unknown protocol vaults', () => {
		const vault = createTestVault('Test vault', {
			protocol: '<protocol not yet identified>',
			risk: 'Low'
		});
		expect(isEligibleFrontpageVault(vault)).toBe(false);
	});
});

describe('getProtocolDisplayName', () => {
	test('aliases unidentified protocol placeholder to Unknown', () => {
		expect(getProtocolDisplayName('<protocol not yet identified>')).toBe('Unknown');
	});

	test('aliases ERC-4626 slug to unknown vault protocol', () => {
		expect(getProtocolDisplayName('ERC-4626', 'erc-4626')).toBe('Unknown vault protocol');
	});

	test('returns the protocol name when it is supported', () => {
		expect(getProtocolDisplayName('Yearn')).toBe('Yearn');
	});
});

describe('normaliseVaultProtocolDisplayName', () => {
	test('maps ERC-4626 vault protocol display name', () => {
		const vault = createTestVault('ERC-4626 vault', {
			protocol: 'ERC-4626',
			protocol_slug: 'erc-4626'
		});

		expect(normaliseVaultProtocolDisplayName(vault).protocol).toBe('Unknown vault protocol');
	});
});

describe('isUnsupportedProtocolSlug', () => {
	test('matches the protocol not yet identified placeholder slug', () => {
		expect(isUnsupportedProtocolSlug('protocol-not-yet-identified')).toBe(true);
	});

	test('matches the unknown ERC-7450 placeholder slug', () => {
		expect(isUnsupportedProtocolSlug('unknown-erc-7450')).toBe(true);
	});

	test('matches manually mapped unknown protocol slugs', () => {
		expect(isUnsupportedProtocolSlug('erc-4626')).toBe(true);
	});

	test('ignores supported protocol slugs', () => {
		expect(isUnsupportedProtocolSlug('yearn')).toBe(false);
	});
});

describe('isUnknownVaultProtocol', () => {
	test.each([
		{ protocol: 'ERC-4626', protocol_slug: 'erc-4626' },
		{ protocol: '<protocol not yet identified>', protocol_slug: 'protocol-not-yet-identified' },
		{ protocol: 'Unknown', protocol_slug: 'unknown' }
	])('groups $protocol as unknown', (vault) => {
		expect(isUnknownVaultProtocol(vault)).toBe(true);
	});

	test('does not group a recognised protocol as unknown', () => {
		expect(isUnknownVaultProtocol({ protocol: 'Yearn', protocol_slug: 'yearn' })).toBe(false);
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

describe('denomination TVL conversion', () => {
	test('detects non-USD denomination from token rate metadata', () => {
		const vault = createTestVault('EUR vault', {
			denomination: 'EURS',
			denomination_token_rate: createDenominationTokenRate({
				native_rate_currency: 'eur',
				usd_rate: 1.08
			})
		});

		expect(getVaultDenominationCurrency(vault)).toBe('eur');
		expect(isNonUsdDenominatedVault(vault)).toBe(true);
	});

	test('does not treat USD denomination as international', () => {
		const vault = createTestVault('USDC vault', {
			denomination_token_rate: createDenominationTokenRate({
				native_rate_currency: 'usd',
				usd_rate: 1
			})
		});

		expect(getVaultDenominationCurrency(vault)).toBe('usd');
		expect(isNonUsdDenominatedVault(vault)).toBe(false);
	});

	test('converts current and peak TVL to USD using the denomination token rate', () => {
		const vault = createTestVault('EUR vault', {
			current_nav: 100_000,
			peak_nav: 120_000,
			denomination_token_rate: createDenominationTokenRate({
				native_rate_currency: 'eur',
				usd_rate: 1.08
			})
		});

		expect(getVaultCurrentTvlUsd(vault)).toBeCloseTo(108_000);
		expect(getVaultPeakTvlUsd(vault)).toBeCloseTo(129_600);
	});

	test('uses USD TVL for cross-denomination aggregate inputs', () => {
		const eurVault = createTestVault('EUR vault', {
			current_nav: 100_000,
			one_month_cagr: 0.1,
			denomination_token_rate: createDenominationTokenRate({ usd_rate: 1.08 })
		});
		const usdVault = createTestVault('USD vault', {
			current_nav: 100_000,
			one_month_cagr: 0,
			denomination_token_rate: createDenominationTokenRate({ usd_rate: 1 })
		});

		const usdVaults = [eurVault, usdVault].map(withVaultCurrentTvlUsd);

		expect(calculateTotalTvl(usdVaults)).toBeCloseTo(208_000);
		expect(calculateTvlWeightedApy(usdVaults)).toBeCloseTo(108_000 / 208_000 / 10);
	});

	test('infers EUR denomination when per-vault rate metadata is absent', () => {
		const vault = createTestVault('EURCV vault', {
			denomination: 'EURCV',
			normalised_denomination: 'EURCV',
			denomination_slug: 'eurcv'
		});

		expect(getVaultDenominationCurrency(vault)).toBe('eur');
		expect(isNonUsdDenominatedVault(vault)).toBe(true);
	});

	test('keeps USD-branded denominations out of international listings', () => {
		const vault = createTestVault('USDG vault', {
			denomination: 'USDG',
			normalised_denomination: 'USDG',
			denomination_slug: 'usdg'
		});

		expect(getVaultDenominationCurrency(vault)).toBe('usd');
		expect(isNonUsdDenominatedVault(vault)).toBe(false);
	});

	test('does not treat a missing non-USD exchange rate as one dollar', () => {
		const vault = createTestVault('tGBP vault', {
			current_nav: 100_000,
			denomination: 'tGBP',
			normalised_denomination: 'tGBP',
			denomination_slug: 'tgbp'
		});

		expect(getVaultDenominationCurrency(vault)).toBe('gbp');
		expect(getVaultDenominationUsdRate(vault)).toBeNull();
		expect(getVaultCurrentTvlUsd(vault)).toBeNull();
	});

	test('enriches EUR vaults with currency fallback rates when token metadata has no USD rate', () => {
		const vault = createTestVault('EURCV vault', {
			current_nav: 100_000,
			denomination: 'EURCV',
			normalised_denomination: 'EURCV',
			denomination_slug: 'eurcv'
		});
		const currencyUsdRates = getCurrencyUsdRates([
			createStablecoinMetadata({
				slug: 'eura',
				symbol: 'EURA',
				usd_rate: 1.14,
				usd_rate_fetched_at: '2026-06-26T12:16:16Z',
				peg_rate: 1,
				peg_rate_currency: 'eur'
			})
		]);
		const eurcvMetadata = createStablecoinMetadata({
			slug: 'eurcv',
			symbol: 'EURCV',
			name: 'SG-FORGE EUR CoinVertible',
			peg_rate_currency: null,
			usd_rate: null,
			peg_rate: null
		});

		const enrichedVault = withVaultDenominationTokenRate(vault, eurcvMetadata, currencyUsdRates);

		expect(getVaultCurrentTvlUsd(enrichedVault)).toBeCloseTo(114_000);
		expect(getVaultTvlNative(enrichedVault, enrichedVault.current_nav)).toBeCloseTo(100_000);
		expect(enrichedVault.denomination_token_rate?.usd_rate_fetched_at).toBe('2026-06-26T12:16:16Z');
		expect(enrichedVault.denomination_token_rate?.source_currency_usd_rate_fetched_at).toBe('2026-06-26T12:16:16Z');
	});

	test('replaces empty denomination token rate objects with inferred fallback rates', () => {
		const vault = createTestVault('EURCV vault', {
			current_nav: 100_000,
			peak_nav: 120_000,
			denomination: 'EURCV',
			normalised_denomination: 'EURCV',
			denomination_slug: 'eurcv',
			denomination_token_rate: createDenominationTokenRate()
		});
		const currencyUsdRates = getCurrencyUsdRates([
			createStablecoinMetadata({
				slug: 'eura',
				symbol: 'EURA',
				usd_rate: 1.14,
				usd_rate_fetched_at: '2026-06-26T12:16:16Z',
				peg_rate: 1,
				peg_rate_currency: 'eur'
			})
		]);

		const enrichedVault = withVaultDenominationTokenRate(vault, undefined, currencyUsdRates);

		expect(enrichedVault.denomination_token_rate?.usd_rate).toBe(1.14);
		expect(getVaultCurrentTvlUsd(enrichedVault)).toBeCloseTo(114_000);
		expect(getVaultPeakTvlUsd(enrichedVault)).toBeCloseTo(136_800);
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
