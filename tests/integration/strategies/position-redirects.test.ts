import { expect, test } from '@playwright/test';

const base = '/strategies/lix';

test.describe('position URLs with a stale status', () => {
	// the Lix fixture has open positions 1–5 and no closed ones; the same redirect sends
	// links to a closed position's former `open-positions` URL to `closed-positions`
	test('redirect to the status the position has now', async ({ request }) => {
		const response = await request.get(`${base}/closed-positions/2`, { maxRedirects: 0 });

		expect(response.status()).toBe(301);
		expect(response.headers().location).toBe(`${base}/open-positions/2`);
	});

	test('keep returning 404 for a position that does not exist', async ({ request }) => {
		const response = await request.get(`${base}/open-positions/999`, { maxRedirects: 0 });

		expect(response.status()).toBe(404);
	});
});
