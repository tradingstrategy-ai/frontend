import { describe, expect, test } from 'vitest';
import {
	buildCore3RiskPayload,
	CORE3_RISK_MIN_TVL,
	CORE3_RISK_OUTLIER_THRESHOLD,
	type Core3RiskPayload
} from './core3-risk';

function createVault(overrides: Record<string, unknown> = {}) {
	return {
		id: 'vault',
		name: 'Vault',
		vault_slug: 'vault',
		protocol_slug: 'aave',
		lifetime_return: null,
		lifetime_return_net: null,
		cagr: null,
		cagr_net: null,
		three_months_returns: null,
		three_months_returns_net: null,
		three_months_cagr: 0.04,
		three_months_cagr_net: null,
		three_months_sharpe: null,
		three_months_sharpe_net: null,
		three_months_volatility: null,
		one_month_returns: null,
		one_month_returns_net: null,
		one_month_cagr: 0.03,
		one_month_cagr_net: null,
		denomination: 'USDC',
		normalised_denomination: 'USD Coin',
		denomination_slug: 'usdc',
		share_token: 'A',
		chain: 'Ethereum',
		peak_nav: 120,
		current_nav: 100_000,
		years: null,
		mgmt_fee: null,
		perf_fee: null,
		deposit_fee: null,
		withdraw_fee: null,
		fee_mode: null,
		fee_internalised: null,
		gross_fees: null,
		net_fees: null,
		lockup: null,
		event_count: null,
		protocol: 'Aave',
		risk: 'Low',
		risk_numeric: 20,
		start_date: '2025-01-01T00:00:00',
		end_date: '2026-01-01T00:00:00',
		address: '0x1111111111111111111111111111111111111111',
		share_token_address: null,
		denomination_token_address: null,
		chain_id: 1,
		stablecoinish: true,
		first_updated_at: null,
		first_updated_block: null,
		last_updated_at: '2026-01-01T00:00:00',
		last_updated_block: 1,
		last_share_price: null,
		features: [],
		flags: [],
		notes: null,
		deposit_closed_reason: null,
		redemption_closed_reason: null,
		deposit_next_open: null,
		redemption_next_open: null,
		link: null,
		trading_strategy_link: null,
		fee_label: null,
		deposit_ui_link: null,
		vault_page_link: null,
		share_token_link: null,
		deposit_manager_link: null,
		badges: [],
		period_results: [],
		...overrides
	} as any;
}

function getBand(payload: Core3RiskPayload, key: string) {
	const band = payload.bands.find((item) => item.key === key);
	if (!band) throw new Error(`Missing band ${key}`);
	return band;
}

describe('buildCore3RiskPayload', () => {
	test('groups stablecoin vault TVL by CORE3 score band and computes coverage', () => {
		const payload = buildCore3RiskPayload(
			[
				createVault({
					id: 'a',
					name: 'Aave USDC',
					vault_slug: 'aave-usdc',
					current_nav: 100_000,
					three_months_cagr: 0.06
				}),
				createVault({
					id: 'b',
					name: 'Spark USDC',
					vault_slug: 'spark-usdc',
					protocol: 'Spark',
					protocol_slug: 'spark',
					current_nav: 300_000,
					three_months_cagr: 0.03
				}),
				createVault({
					id: 'c',
					name: 'Unrated USDC',
					vault_slug: 'unrated-usdc',
					protocol: 'Unrated',
					protocol_slug: 'unrated',
					current_nav: 200_000,
					three_months_cagr: 0.01
				})
			],
			{
				aave: {
					slug: 'aave',
					name: 'Aave',
					pol: { score: 18, rating: 'AA', confidence: 'High' }
				},
				spark: {
					slug: 'spark',
					name: 'Spark',
					pol: { score: 42, rating: 'BBB', confidence: 'Moderate' }
				}
			} as any,
			12,
			new Date('2026-06-18T12:00:00Z')
		);

		expect(payload.generatedAt).toBe('2026-06-18T12:00:00.000Z');
		expect(payload.meta.includedVaults).toBe(3);
		expect(payload.meta.coveredVaults).toBe(2);
		expect(payload.meta.uncoveredVaults).toBe(1);
		expect(payload.meta.totalStablecoinTvl).toBe(600_000);
		expect(payload.meta.coveredStablecoinTvl).toBe(400_000);
		expect(payload.meta.uncoveredStablecoinTvl).toBe(200_000);
		expect(payload.meta.uncoveredStablecoinTvlShare).toBeCloseTo(1 / 3);

		expect(getBand(payload, '0-20')).toMatchObject({
			tvl: 100_000,
			vaultCount: 1,
			protocolCount: 1,
			weightedThreeMonthCagr: 0.06
		});
		expect(getBand(payload, '40-60')).toMatchObject({
			tvl: 300_000,
			vaultCount: 1,
			protocolCount: 1,
			weightedThreeMonthCagr: 0.03
		});
		expect(getBand(payload, 'not-covered')).toMatchObject({
			tvl: 200_000,
			vaultCount: 1,
			protocolCount: 1,
			weightedThreeMonthCagr: 0.01
		});

		expect(payload.scatterPoints).toHaveLength(2);
		expect(payload.scatterPoints[0]).toMatchObject({
			name: 'Aave USDC',
			core3Score: 18,
			core3Rating: 'AA',
			threeMonthCagr: 0.06,
			href: '/vaults/aave-usdc'
		});
	});

	test('uses compact per-vault CORE3 data when the protocol map has no rating', () => {
		const payload = buildCore3RiskPayload(
			[
				createVault({
					current_nav: 150_000,
					core3: {
						risk_score: 65,
						risk_rating_label: 'CCC',
						confidence: 'Low'
					}
				})
			],
			{},
			0
		);

		expect(payload.meta.coveredVaults).toBe(1);
		expect(getBand(payload, '60-80').tvl).toBe(150_000);
		expect(payload.scatterPoints[0]).toMatchObject({
			core3Score: 65,
			core3Rating: 'CCC',
			core3Confidence: 'Low'
		});
	});

	test('excludes non-stablecoin, small, blacklisted and outlier vaults', () => {
		const payload = buildCore3RiskPayload(
			[
				createVault({ id: 'valid', current_nav: CORE3_RISK_MIN_TVL }),
				createVault({ id: 'small', current_nav: CORE3_RISK_MIN_TVL - 1 }),
				createVault({ id: 'volatile', stablecoinish: false, current_nav: 500_000 }),
				createVault({ id: 'blacklisted', risk_numeric: 999, current_nav: 500_000 }),
				createVault({ id: 'outlier', current_nav: CORE3_RISK_OUTLIER_THRESHOLD + 1 })
			],
			{
				aave: {
					slug: 'aave',
					name: 'Aave',
					pol: { score: 22, rating: 'A', confidence: 'High' }
				}
			} as any,
			0
		);

		expect(payload.meta.includedVaults).toBe(1);
		expect(payload.meta.excludedBlacklistedVaults).toBe(1);
		expect(payload.meta.excludedOutlierVaults).toBe(1);
		expect(payload.meta.totalStablecoinTvl).toBe(CORE3_RISK_MIN_TVL);
	});
});
