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
	});

	it('uses defaults when URL filter indexes are absent', () => {
		const query = parseVaultListingQuery(new URLSearchParams(), { risk: 1, tvl: '10k' });

		expect(query.risk).toBe(1);
		expect(query.tvl).toBe('10k');
	});

	it('keeps a blacklisted definition scoped to blacklisted vaults', () => {
		const safe = createTestVault('Safe', { current_nav: 100_000 });
		const blacklisted = createTestVault('Blacklisted', { current_nav: 100_000, risk: 'Blacklisted' });

		expect(filterVaultListingScope([safe, blacklisted], 'blacklisted').map((vault) => vault.name)).toEqual([
			'Blacklisted'
		]);
	});

	it('keeps the unknown-vault defaults aligned with detail listing routes', () => {
		expect(getVaultListingDefaults('protocol', 'unknown').unknown).toBe(false);
		expect(getVaultListingDefaults('stablecoin', 'usdc').unknown).toBe(false);
		expect(getVaultListingDefaults('curator', 'mev-capital').unknown).toBe(false);
	});

	it('does not expose the complete dataset through an international scope predicate', () => {
		const vault = createTestVault('EUR vault', { denomination: 'EURC' });

		expect(filterVaultListingScope([vault], 'international')).toEqual([]);
	});
});
