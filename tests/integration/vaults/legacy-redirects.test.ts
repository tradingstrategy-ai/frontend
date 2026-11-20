import { expect, test } from '@playwright/test';

test.describe('legacy chain vault URLs', () => {
	test('redirect by vault address when the link carries one', async ({ request }) => {
		const response = await request.get(
			'/trading-view/hyperliquid/vaults/rektober-2?a=0xE3C97B18216F58AF4B9C1347D0EE010C42E6A85D&ref=trading-strategy.ghost.io',
			{ maxRedirects: 0 }
		);

		expect(response.status()).toBe(301);
		expect(response.headers().location).toBe('/vaults/address/0xe3c97b18216f58af4b9c1347d0ee010c42e6a85d');
	});

	test('redirect by slug without an address', async ({ request }) => {
		const response = await request.get('/trading-view/ethereum/vaults/some-vault?a=not-an-address', {
			maxRedirects: 0
		});

		expect(response.status()).toBe(301);
		expect(response.headers().location).toBe('/vaults/some-vault');
	});
});
