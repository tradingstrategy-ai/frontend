import { makeSolanaVaultAddress } from '$lib/helpers/solana';
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

	test('finds a Solana vault by its native account and returns the original case', async () => {
		const account = 'J7qhMAKnB6G5dvoAN9281ufabajKbyGQxxd2bq6R7fPJ';
		mocks.getCachedTopVaults.mockResolvedValue({
			generated_at: '2026-11-12T00:00:00.000Z',
			vaults: [
				createTestVault('Neutral Autopilot', {
					chain: 'solana',
					chain_id: 9992,
					address: makeSolanaVaultAddress(account),
					protocol: 'Neutral Trade'
				})
			],
			core3_protocols: {},
			curators: {},
			categories: {}
		} satisfies TopVaults);
		const result = await searchVaultEntities(vi.fn() as unknown as Fetch, account);
		expect(result.results[0]).toMatchObject({ address: account, chainName: 'Solana' });
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

	describe('strategy categories', () => {
		let fixtureVersion = 0;
		beforeEach(() => {
			mocks.getCachedTopVaults.mockResolvedValue({
				generated_at: new Date(Date.UTC(2026, 10, 16, 0, 0, fixtureVersion++)).toISOString(),
				vaults: [
					createTestVault('Directional trading vault', {
						current_nav: 1_000_000,
						strategy_tags: ['directional_trading']
					}),
					createTestVault('Directional trading blacklisted vault', {
						current_nav: 2_000_000,
						risk: 'Blacklisted'
					})
				],
				core3_protocols: {},
				curators: {},
				categories: {
					directional_trading: {
						label: 'Directional trading',
						description: 'Momentum exposure.',
						vault_count: 1,
						tvl_usd: 750_000,
						one_month_apy: 0.08
					},
					zero_vault: {
						label: 'Empty category',
						description: 'A registered category with no member vaults.',
						vault_count: 0,
						tvl_usd: 0,
						one_month_apy: null
					},
					unknown: {
						label: 'Unknown strategy',
						description: 'Hidden category.',
						vault_count: 0,
						tvl_usd: 0,
						one_month_apy: null
					}
				}
			} satisfies TopVaults);
		});

		test.each(['Directional trading', 'DIRECTIONAL_TRADING', 'directional-trading'])(
			'finds categories by label and normalised tag: %s',
			async (query) => {
				const response = await searchVaultEntities(vi.fn() as unknown as Fetch, query);
				expect(response.results.find((result) => result.entityType === 'strategy-category')).toEqual({
					id: 'strategy-category:directional_trading',
					name: 'Directional trading',
					entityType: 'strategy-category',
					averageApy1m: 0.08,
					latestTvl: 750_000,
					href: '/vaults/strategies/directional-trading',
					vaultId: null,
					address: null,
					protocolName: null,
					chainName: null,
					logoUrl: null
				});
			}
		);

		test('finds a zero-vault category by its source tag with null APY', async () => {
			const response = await searchVaultEntities(vi.fn() as unknown as Fetch, 'zero-vault');
			expect(response.results).toHaveLength(1);
			expect(response.results[0]).toMatchObject({
				name: 'Empty category',
				entityType: 'strategy-category',
				latestTvl: 0,
				averageApy1m: null,
				href: '/vaults/strategies/zero-vault'
			});
		});

		test('hides unknown categories and does not index descriptions', async () => {
			for (const query of ['Unknown strategy', 'Momentum']) {
				const response = await searchVaultEntities(vi.fn() as unknown as Fetch, query);
				expect(response.results).toEqual([]);
			}
		});

		test('keeps categories in TVL order and blacklisted vaults last', async () => {
			const response = await searchVaultEntities(vi.fn() as unknown as Fetch, 'directional trading', 10, {
				sort: 'tvl'
			});
			expect(response.results.map(({ entityType, latestTvl }) => [entityType, latestTvl])).toEqual([
				['vault', 1_000_000],
				['strategy-category', 750_000],
				['blacklisted-vault', 2_000_000]
			]);
		});

		test('excludes categories from vault-only selector results', async () => {
			const response = await searchVaultEntities(vi.fn() as unknown as Fetch, 'directional trading', 10, {
				entityTypes: ['vault', 'tokenised-fund', 'blacklisted-vault']
			});
			expect(response.results.map(({ entityType }) => entityType)).toEqual(['vault', 'blacklisted-vault']);
		});
	});

	test('handles an empty category registry', async () => {
		const response = await searchVaultEntities(vi.fn() as unknown as Fetch, 'directional trading');
		expect(response.results).toEqual([]);
	});
});
