import { describe, expect, it } from 'vitest';
import { filterVaultListingScope, getVaultListingDefaults } from './definitions';
import { queryVaultListing, sortVaults } from './query';
import { parseVaultListingQuery } from './state';
import { createTestVault } from '../test-utils';

const options = {
	includeBlacklisted: false,
	filterTvl: false,
	showFilters: true,
	tvlThreshold: 50_000,
	includeBlacklistedInStats: false
};

describe('vault listing query', () => {
	it('uses the canonical vault key to break equal sort values deterministically', () => {
		const later = createTestVault('Later', {
			address: '0x0000000000000000000000000000000000000002',
			current_nav: 100_000
		});
		const earlier = createTestVault('Earlier', {
			address: '0x0000000000000000000000000000000000000001',
			current_nav: 100_000
		});

		expect(sortVaults([later, earlier], 'tvl', 'desc').map((vault) => vault.name)).toEqual(['Earlier', 'Later']);
	});

	it('sorts provider ratings by the selected provider before pagination', () => {
		const core3Safer = createTestVault('CORE3 safer', {
			core3: { risk_score: 10, risk_rating_label: 'AA' },
			xerberus: {
				score: 20,
				score_scale: '0-100',
				entity_type: 'protocol',
				entity_id: 'core3-safer',
				name: 'CORE3 safer',
				protocol_slug: 'core3-safer',
				report_url: null,
				fetched_at: '2026-01-01T00:00:00Z'
			}
		});
		const core3Riskier = createTestVault('CORE3 riskier', {
			core3: { risk_score: 80, risk_rating_label: 'D' },
			xerberus: {
				score: 90,
				score_scale: '0-100',
				entity_type: 'protocol',
				entity_id: 'core3-riskier',
				name: 'CORE3 riskier',
				protocol_slug: 'core3-riskier',
				report_url: null,
				fetched_at: '2026-01-01T00:00:00Z'
			}
		});

		expect(
			sortVaults([core3Riskier, core3Safer], 'provider_risk_rating', 'asc', 'core3').map((vault) => vault.name)
		).toEqual(['CORE3 safer', 'CORE3 riskier']);
	});

	it('filters before it sorts and slices the matching population', () => {
		const accepted = createTestVault('Accepted', {
			current_nav: 100_000,
			one_month_cagr: 0.12,
			risk: 'Low'
		});
		const belowTvl = createTestVault('Below TVL', {
			current_nav: 9_999,
			one_month_cagr: 0.9,
			risk: 'Low'
		});
		const blacklisted = createTestVault('Blacklisted', { current_nav: 1_000_000, risk: 'Blacklisted' });
		const query = parseVaultListingQuery(new URLSearchParams(), { tvl: '10k' });

		const result = queryVaultListing([belowTvl, blacklisted, accepted], query, options);

		expect(result.vaults.map((vault) => vault.name)).toEqual(['Accepted']);
		expect(result.hiddenByTvl).toBe(1);
		expect(result.hiddenBlacklistedCount).toBe(1);
	});

	it('counts only blacklisted vaults that the reveal action can display', () => {
		const belowTvl = createTestVault('Below TVL', { current_nav: 9_999, risk: 'Blacklisted' });
		const hiddenByAge = createTestVault('Too old', { current_nav: 100_000, years: 2, risk: 'Blacklisted' });
		const revealable = createTestVault('Revealable', { current_nav: 100_000, years: 0.5, risk: 'Blacklisted' });
		const query = parseVaultListingQuery(new URLSearchParams('age=2'), { tvl: '10k' });

		const result = queryVaultListing([belowTvl, hiddenByAge, revealable], query, options);

		expect(result.hiddenBlacklistedCount).toBe(1);
	});

	it('does not report blacklisted vaults as hidden once the Blacklisted risk filter is active', () => {
		const blacklisted = createTestVault('Blacklisted', { current_nav: 100_000, risk: 'Blacklisted' });
		const query = parseVaultListingQuery(new URLSearchParams('risk=0'), { tvl: '10k' });

		const result = queryVaultListing([blacklisted], query, options);

		expect(result.vaults.map((vault) => vault.name)).toEqual(['Blacklisted']);
		expect(result.hiddenBlacklistedCount).toBe(0);
	});

	it('excludes blacklisted vaults from the listing summary by default', () => {
		const included = createTestVault('Included', {
			current_nav: 100_000,
			one_month_cagr: 0.05,
			risk: 'Low'
		});
		const blacklisted = createTestVault('Blacklisted', {
			current_nav: 10_000_000,
			one_month_cagr: 5,
			risk: 'Blacklisted'
		});
		const query = parseVaultListingQuery(new URLSearchParams(), { tvl: '10k', risk: 0 });

		const result = queryVaultListing([included, blacklisted], query, {
			...options,
			includeBlacklisted: true,
			includeBlacklistedInStats: false
		});

		expect(result.vaults).toHaveLength(2);
		expect(result.totalTvl).toBe(100_000);
		expect(result.avgTvlWeightedApy1M).toBe(0.05);
	});

	it('applies the supplied Treasury rate to monthly-return filters', () => {
		const aboveTreasury = createTestVault('Above Treasury', { current_nav: 100_000, one_month_cagr: 0.06 });
		const belowTreasury = createTestVault('Below Treasury', { current_nav: 100_000, one_month_cagr: 0.04 });
		const query = parseVaultListingQuery(new URLSearchParams('mr=treasury'), { tvl: '10k' });

		const result = queryVaultListing([aboveTreasury, belowTreasury], query, { ...options, treasuryRate: 5 });

		expect(result.vaults.map((vault) => vault.name)).toEqual(['Above Treasury']);
	});

	it('filters vaults by strict three-month volatility brackets', () => {
		const belowThreshold = createTestVault('Below threshold', {
			current_nav: 100_000,
			three_months_volatility: 0.09
		});
		const atThreshold = createTestVault('At threshold', {
			current_nav: 100_000,
			three_months_volatility: 0.1
		});
		const missingVolatility = createTestVault('Missing volatility', { current_nav: 100_000 });
		const query = parseVaultListingQuery(new URLSearchParams('vol=10'), { tvl: '10k' });

		expect(
			queryVaultListing([belowThreshold, atThreshold, missingVolatility], query, options).vaults.map(
				(vault) => vault.name
			)
		).toEqual(['Below threshold']);
	});

	it('uses defaults when URL filters are absent', () => {
		const query = parseVaultListingQuery(new URLSearchParams(), { risk: 1, tvl: '10k' });

		expect(query.risk).toBe(1);
		expect(query.tvl).toBe('10k');
	});

	it('falls back to Any for an unknown volatility key', () => {
		const invalidVolatility = parseVaultListingQuery(new URLSearchParams('vol=invalid'));

		expect(invalidVolatility.vol).toBe('any');
	});

	it('hides permissioned vaults when requested', () => {
		const publicVault = createTestVault('Public', { current_nav: 100_000 });
		const privateVault = createTestVault('Private', {
			current_nav: 100_000,
			whitelist: { status: 'whitelisted', notes: null }
		});
		const privateFund = createTestVault('Private fund', {
			current_nav: 100_000,
			flags: ['tokenised_fund'],
			whitelist: { status: 'whitelisted', notes: null }
		});
		const query = parseVaultListingQuery(new URLSearchParams('private=1'), { tvl: '10k' });

		expect(
			queryVaultListing([publicVault, privateVault, privateFund], query, options).vaults.map((vault) => vault.name)
		).toEqual(['Public']);
	});

	it('hides AMM-like vaults when requested', () => {
		const vault = createTestVault('Vault', { current_nav: 100_000 });
		const pool = createTestVault('Pool', { current_nav: 100_000, features: ['amm_pool_like'] });
		const query = parseVaultListingQuery(new URLSearchParams('amm=1'), { tvl: '10k' });

		expect(queryVaultListing([vault, pool], query, options).vaults.map((item) => item.name)).toEqual(['Vault']);
	});

	it('hides explicitly unknown protocols when sorting by three-month Sharpe', () => {
		const known = createTestVault('Known', {
			current_nav: 100_000,
			three_months_sharpe: 1
		});
		const unknown = createTestVault('Unknown', {
			current_nav: 100_000,
			protocol: 'Unknown',
			protocol_slug: 'unrelated-slug',
			three_months_sharpe: 10
		});
		const query = parseVaultListingQuery(new URLSearchParams('sort=three_months_sharpe'), { tvl: '10k' });

		expect(queryVaultListing([known, unknown], query, options).vaults.map((item) => item.name)).toEqual(['Known']);
	});

	it('only accepts provider rating sorting on a provider listing', () => {
		const params = new URLSearchParams('sort=provider_risk_rating');

		expect(parseVaultListingQuery(params).sort).not.toBe('provider_risk_rating');
		expect(parseVaultListingQuery(params, { sort: 'provider_risk_rating' }).sort).toBe('provider_risk_rating');
	});

	it('keeps a blacklisted definition scoped to blacklisted vaults', () => {
		const safe = createTestVault('Safe', { current_nav: 100_000 });
		const blacklisted = createTestVault('Blacklisted', { current_nav: 100_000, risk: 'Blacklisted' });

		expect(filterVaultListingScope([safe, blacklisted], 'blacklisted').map((vault) => vault.name)).toEqual([
			'Blacklisted'
		]);
	});

	it('keeps a whitelisted definition scoped to permissioned vaults', () => {
		const permissionless = createTestVault('Permissionless', { current_nav: 100_000 });
		const whitelisted = createTestVault('Whitelisted', {
			current_nav: 100_000,
			whitelist: { status: 'whitelisted', notes: null }
		});

		expect(filterVaultListingScope([permissionless, whitelisted], 'whitelisted').map((vault) => vault.name)).toEqual([
			'Whitelisted'
		]);
	});

	it('defaults the whitelisted listing to Dangerous risk or safer', () => {
		expect(getVaultListingDefaults('whitelisted').risk).toBe(1);
	});

	it('keeps the unknown-vault defaults aligned with detail listing routes', () => {
		expect(getVaultListingDefaults('protocol', 'unknown').unknown).toBe(false);
		expect(getVaultListingDefaults('stablecoin', 'usdc').unknown).toBe(false);
		expect(getVaultListingDefaults('curator', 'mev-capital').unknown).toBe(false);
	});

	it('shows AMM-like pools by default on protocol listings', () => {
		expect(parseVaultListingQuery(new URLSearchParams(), getVaultListingDefaults('top')).amm).toBe(true);
		expect(parseVaultListingQuery(new URLSearchParams(), getVaultListingDefaults('protocol', 'gmx')).amm).toBe(false);
	});

	it('keeps Apex server pagination aligned with its TVL-sorted page', () => {
		expect(getVaultListingDefaults('protocol', 'apex')).toMatchObject({
			tvl: 'any',
			sort: 'tvl',
			direction: 'desc'
		});
	});

	it('includes unknown protocols and AMM-like vaults on provider rating pages', () => {
		for (const key of ['core3-ratings', 'xerberus-ratings'] as const) {
			expect(parseVaultListingQuery(new URLSearchParams(), getVaultListingDefaults(key))).toMatchObject({
				unknown: false,
				amm: false
			});
		}
	});

	it('does not expose the complete dataset through an international scope predicate', () => {
		const vault = createTestVault('EUR vault', { denomination: 'EURC' });

		expect(filterVaultListingScope([vault], 'international')).toEqual([]);
	});
});
