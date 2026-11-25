import { describe, expect, it } from 'vitest';
import {
	getCore3PolForVault,
	getVaultCurrentTvlUsd,
	getVaultDenominationCurrency,
	getVaultDenominationNativeRate,
	getVaultDenominationUsdRate,
	getVaultPeakTvlUsd,
	isNonUsdDenominatedVault,
	toVaultListingRow
} from './helpers';
import { type VaultInfo, vaultListingPeriodMetricKeys, vaultListingRowKeys } from './schemas';
import { createPeriodMetrics, createTestVault } from './test-utils';

describe('toVaultListingRow', () => {
	const lifetime = { ...createPeriodMetrics('lifetime', 0.2, 0.2, 0.18), max_drawdown: -0.03, daily_samples: 365 };
	const vault = createTestVault('Projection vault', {
		description: 'A long marketing description that the listing table never renders',
		period_results: [lifetime]
	});

	const row = toVaultListingRow(vault);

	it('keeps exactly the listing row keys plus period results', () => {
		expect(Object.keys(row).sort()).toEqual([...vaultListingRowKeys, 'curator_logo_url', 'period_results'].sort());
	});

	it('resolves the curator logo and keeps the curator name', () => {
		const curated = createTestVault('Curated vault', { curator_slug: 'example', curator_name: 'Example Capital' });
		const curators = {
			example: {
				slug: 'example',
				name: 'Example Capital',
				website: null,
				twitter: null,
				linkedin: null,
				rss: null,
				protocol_curator: false,
				canonical_feeder_id: null,
				logos: { generic: null, light: 'https://example.com/light.svg', dark: null },
				recent_posts: []
			}
		};
		const projected = toVaultListingRow(curated, curators);
		expect(projected.curator_name).toBe('Example Capital');
		expect(projected.curator_logo_url).toBe('https://example.com/light.svg');
		expect(toVaultListingRow(vault, curators).curator_logo_url).toBeNull();
	});

	it('drops detail-only fields', () => {
		expect(row).not.toHaveProperty('description');
		expect(row).not.toHaveProperty('share_token_address');
		expect(row).not.toHaveProperty('first_updated_at');
	});

	it('keeps the fields the table and return columns read', () => {
		expect(row.name).toBe('Projection vault');
		expect(row.one_month_cagr).toBe(vault.one_month_cagr);
		expect(row.lifetime_return).toBe(vault.lifetime_return);
		expect(row.denomination_token_rate).toEqual(vault.denomination_token_rate);
	});

	it('drops the periods no listing column reads', () => {
		const projected = toVaultListingRow({
			...vault,
			period_results: [
				createPeriodMetrics('1W', 0, 0, 0),
				createPeriodMetrics('1M', 0, 0, 0),
				createPeriodMetrics('3M', 0, 0, 0),
				lifetime
			]
		});
		expect(projected.period_results.map((p) => p.period)).toEqual(['3M', 'lifetime']);
	});

	it('slims each period result to the listing metrics', () => {
		expect(row.period_results).toHaveLength(1);
		expect(Object.keys(row.period_results[0]).sort()).toEqual([...vaultListingPeriodMetricKeys].sort());
		expect(row.period_results[0]).toMatchObject({
			period: 'lifetime',
			returns_net: 0.18,
			cagr_gross: 0.2,
			max_drawdown: -0.03,
			daily_samples: 365
		});
		expect(row.period_results[0]).not.toHaveProperty('share_price_start');
		expect(row.period_results[0]).not.toHaveProperty('ranking_overall');
	});

	describe('slimmed nested objects give the same answers as the full record', () => {
		const rate = (overrides: Partial<NonNullable<VaultInfo['denomination_token_rate']>>) => ({
			coingecko_id: 'usd-coin',
			source_currency: null,
			usd_rate: 1,
			usd_rate_fetched_at: '2026-11-21T02:05:24',
			usd_rate_source: 'coingecko',
			native_rate: null,
			native_rate_currency: null,
			native_rate_fetched_at: null,
			native_rate_source: null,
			source_currency_usd_rate: null,
			source_currency_usd_rate_fetched_at: null,
			source_currency_usd_rate_source: null,
			...overrides
		});
		const fixtures: Record<string, VaultInfo> = {
			'depegged stablecoin': createTestVault('Depegged', {
				current_nav: 1_000_000,
				peak_nav: 2_000_000,
				denomination_token_rate: rate({ usd_rate: 0.62 })
			}),
			'unknown USD rate': createTestVault('Unknown rate', {
				current_nav: 500_000,
				peak_nav: 600_000,
				denomination_token_rate: rate({ usd_rate: null, usd_rate_fetched_at: null, usd_rate_source: null })
			}),
			'non-USD peg with native rates': createTestVault('Euro vault', {
				denomination: 'EURC',
				current_nav: 250_000,
				peak_nav: 300_000,
				denomination_token_rate: rate({
					coingecko_id: 'euro-coin',
					source_currency: 'eur',
					usd_rate: 1.16,
					native_rate: 0.998,
					native_rate_currency: 'eur',
					native_rate_fetched_at: '2026-11-21T02:05:24',
					native_rate_source: 'coingecko',
					source_currency_usd_rate: 1.162,
					source_currency_usd_rate_fetched_at: '2026-11-21T02:05:24',
					source_currency_usd_rate_source: 'stablecoin-metadata'
				})
			})
		};

		for (const [label, full] of Object.entries(fixtures)) {
			it(label, () => {
				const listed = toVaultListingRow(full);
				expect(getVaultCurrentTvlUsd(listed)).toBe(getVaultCurrentTvlUsd(full));
				expect(getVaultPeakTvlUsd(listed)).toBe(getVaultPeakTvlUsd(full));
				expect(getVaultDenominationUsdRate(listed)).toBe(getVaultDenominationUsdRate(full));
				expect(getVaultDenominationNativeRate(listed)).toBe(getVaultDenominationNativeRate(full));
				expect(getVaultDenominationCurrency(listed)).toBe(getVaultDenominationCurrency(full));
				expect(isNonUsdDenominatedVault(listed)).toBe(isNonUsdDenominatedVault(full));
				expect(listed.denomination_token_rate).not.toHaveProperty('usd_rate_fetched_at');
				expect(listed.denomination_token_rate).not.toHaveProperty('coingecko_id');
			});
		}

		it('keeps a null rate null rather than dropping it', () => {
			const listed = toVaultListingRow(createTestVault('No rate', { denomination_token_rate: null }));
			expect(listed.denomination_token_rate).toBeNull();
		});

		it('keeps the CORE3 rating fields', () => {
			const full = createTestVault('Rated', {
				core3: {
					risk_score: 31.35,
					market_cap: 1_106_580_484,
					core3_ranking: 44,
					data_coverage: 76.7,
					confidence: 'High',
					risk_rating_label: 'BB'
				}
			});
			const listed = toVaultListingRow(full);
			expect(getCore3PolForVault(listed, {})).toEqual(getCore3PolForVault(full, {}));
			expect(listed.core3).toEqual({ risk_score: 31.35, risk_rating_label: 'BB', confidence: 'High' });
		});

		it('keeps the Xerberus score and whether it rates the pool or the protocol', () => {
			const assessment = (entity_type: string) => ({
				score: 78,
				score_scale: '0_100_higher_is_better',
				entity_type,
				entity_id: `${entity_type}-id`,
				name: 'Morpho',
				protocol_slug: entity_type === 'pool' ? null : 'morpho',
				report_url: `https://app.xerberus.io/${entity_type}`,
				fetched_at: '2026-11-21T15:41:29.769194'
			});
			for (const entityType of ['pool', 'protocol']) {
				const listed = toVaultListingRow(createTestVault('Scored', { xerberus: assessment(entityType) }));
				expect(listed.xerberus).toEqual({ score: 78, entity_type: entityType });
			}
		});
	});
});
