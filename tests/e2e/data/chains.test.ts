/**
 * This test ensures that the local chains cache matches the chains API response.
 *
 * If new chains are added to the backend or chain lookup data changes, this test
 * will fail. Fix it by updating the local chains cache in:
 * src/routes/data/chains/cache.json
 */
import { type APIRequestContext, expect, test } from '@playwright/test';
import type { ApiChain } from '$lib/helpers/chain';
import localChainsCache from '../../../src/routes/data/chains/cache.json' assert { type: 'json' };

// compare function to sort chains by chain_id
const byId = (a: ApiChain, b: ApiChain) => a.chain_id - b.chain_id;

test.describe('chains endpoint', () => {
	let apiContext: APIRequestContext;

	test.beforeAll(async ({ playwright }) => {
		apiContext = await playwright.request.newContext();
	});

	test.afterAll(async () => {
		await apiContext.dispose();
	});

	test('local cache should match API response', async ({ page }) => {
		const response = await apiContext.get('/data/chains');
		const chains = await response.json();
		expect(localChainsCache.sort(byId)).toEqual(chains.sort(byId));
	});
});
