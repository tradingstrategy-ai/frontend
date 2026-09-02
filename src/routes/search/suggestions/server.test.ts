import { describe, expect, test, vi } from 'vitest';

const { searchVaultEntities } = vi.hoisted(() => ({
	searchVaultEntities: vi.fn().mockResolvedValue({ query: 'vault', results: [], total: 0 })
}));

vi.mock('$lib/search/vault-search.server', () => ({ searchVaultEntities }));

import { GET } from './+server';

describe('search suggestions endpoint', () => {
	test('passes the minimum TVL to server-side vault search', async () => {
		const fetch = vi.fn();
		const response = await GET({
			fetch,
			url: new URL('http://localhost/search/suggestions?q=vault&scope=vaults&minimumVaultTvlUsd=1000')
		} as never);

		expect(response.status).toBe(200);
		expect(searchVaultEntities).toHaveBeenCalledWith(fetch, 'vault', 8, {
			diversifyTypes: false,
			entityTypes: ['vault', 'tokenised-fund', 'blacklisted-vault'],
			minimumVaultTvlUsd: 1000
		});
	});

	test('rejects minimum TVL filtering for site-wide search', async () => {
		const response = await GET({
			fetch: vi.fn(),
			url: new URL('http://localhost/search/suggestions?q=vault&scope=all&minimumVaultTvlUsd=1000')
		} as never);

		expect(response.status).toBe(400);
	});
});
