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
			curators: {},
			categories: {}
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

	test('can order matching vaults by latest TVL', async () => {
		mocks.getCachedTopVaults.mockResolvedValue({
			generated_at: '2026-09-03T00:00:00.000Z',
			vaults: [
				createTestVault('Small vault', { current_nav: 10_000 }),
				createTestVault('Large vault', { current_nav: 1_000_000 }),
				createTestVault('Largest blacklisted vault', { current_nav: 2_000_000, risk: 'Blacklisted' })
			],
			core3_protocols: {},
			curators: {},
			categories: {}
		} satisfies TopVaults);

		const response = await searchVaultEntities(vi.fn() as unknown as Fetch, 'vault', 10, { sort: 'tvl' });

		expect(response.results.map(({ name }) => name)).toEqual([
			'Large vault',
			'Small vault',
			'Largest blacklisted vault'
		]);
	});

	test('orders matching vaults and aggregate entities by latest TVL', async () => {
		mocks.getCachedTopVaults.mockResolvedValue({
			generated_at: '2026-09-04T00:00:00.000Z',
			vaults: [
				createTestVault('Large Ethereum vault', { chain: 'ethereum', current_nav: 1_000_000 }),
				createTestVault('Small Ethereum vault', { chain: 'ethereum', current_nav: 10_000 })
			],
			core3_protocols: {},
			curators: {},
			categories: {}
		} satisfies TopVaults);

		const response = await searchVaultEntities(vi.fn() as unknown as Fetch, 'ethereum', 10, { sort: 'tvl' });
		const tvls = response.results.map((result) => result.latestTvl ?? -1);

		expect(response.results.map((result) => result.entityType)).toEqual(expect.arrayContaining(['chain', 'vault']));
		expect(tvls).toEqual([...tvls].toSorted((a, b) => b - a));
	});
});
