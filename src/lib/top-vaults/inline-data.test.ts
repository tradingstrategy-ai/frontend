import { describe, expect, it } from 'vitest';
import { INLINE_VAULT_COUNT_LIMIT, getInlineVaultListing } from './inline-data';
import { createTestVault } from './test-utils';

describe('getInlineVaultListing', () => {
	const topVaults = {
		generated_at: '2026-07-24T00:00:00.000Z',
		vaults: [createTestVault('Vault')],
		core3_protocols: {},
		curators: {}
	};

	it('includes listings with fewer than 100 vaults', () => {
		const listing = getInlineVaultListing(topVaults, topVaults.vaults);

		expect(listing).toEqual(topVaults);
	});

	it('keeps listings with 100 vaults out of the initial page data', () => {
		const vaults = Array.from({ length: INLINE_VAULT_COUNT_LIMIT }, (_, index) => createTestVault(`Vault ${index}`));

		expect(getInlineVaultListing({ ...topVaults, vaults }, vaults)).toBeUndefined();
	});
});
