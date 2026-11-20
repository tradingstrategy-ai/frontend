import { expect, test } from '@playwright/test';

const address = '0x2000000000000000000000000000000000000001';

test.describe('vault address URLs', () => {
	test('redirect /vaults/<address> to the vault page', async ({ request }) => {
		const response = await request.get(`/vaults/${address}`, { maxRedirects: 0 });
		const viaAddressRoute = await request.get(`/vaults/address/${address}`, { maxRedirects: 0 });

		// SvelteKit `resolve()` makes the Location relative to the request path
		const target = (from: string, location: string) => new URL(location, `http://localhost${from}`).pathname;
		expect(response.status()).toBe(301);
		expect(target(`/vaults/${address}`, response.headers().location)).toBe('/vaults/gmx-usdc-pool');
		expect(target(`/vaults/address/${address}`, viaAddressRoute.headers().location)).toBe('/vaults/gmx-usdc-pool');
	});

	test('keep returning 404 for an unknown address', async ({ request }) => {
		const response = await request.get('/vaults/0x9000000000000000000000000000000000000009', { maxRedirects: 0 });

		expect(response.status()).toBe(404);
	});
});
