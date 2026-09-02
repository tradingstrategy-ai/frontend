import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createTestVault } from '$lib/top-vaults/test-utils';
import type { TopVaults } from '$lib/top-vaults/schemas';

const mocks = vi.hoisted(() => ({
	getCachedTopVaults: vi.fn(),
	fetchStablecoinMetadataIndex: vi.fn()
}));

vi.mock('$lib/top-vaults/cache', () => ({ getCachedTopVaults: mocks.getCachedTopVaults }));
vi.mock('$lib/stablecoin-metadata/client', () => ({
	fetchStablecoinMetadataIndex: mocks.fetchStablecoinMetadataIndex
}));

import { searchVaultEntities } from './vault-search.server';

describe('vault search', () => {
	beforeEach(() => {
		mocks.getCachedTopVaults.mockResolvedValue({
			generated_at: '2026-09-02T00:00:00.000Z',
			vaults: [{ ...createTestVault('Yearn Bold vault'), share_token: 'yBOLD' }],
			core3_protocols: {},
			curators: {}
		} satisfies TopVaults);
		mocks.fetchStablecoinMetadataIndex.mockResolvedValue([]);
	});

	test('finds a vault by its share token symbol without case sensitivity', async () => {
		const response = await searchVaultEntities(vi.fn() as unknown as Fetch, 'ybold');

		expect(response.results).toHaveLength(1);
		expect(response.results[0]).toMatchObject({
			entityType: 'vault',
			name: 'Yearn Bold vault'
		});
	});
});
