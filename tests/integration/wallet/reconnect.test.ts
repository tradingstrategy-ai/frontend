import { expect, test } from '@playwright/test';
import { installMockRabby, getMockRabbyRequests } from './mock-rabby';

// Enzyme strategy from the mock API: deposits enabled, so the "My deposits" panel renders
const STRATEGY = '/strategies/enzyme-polygon-matic-usdc';
const ADDRESS = '0x0d7786000000000000000000000000000000beef';
const POLYGON = 137;

// wallet client resets a stalled reconnect after 10s (RECONNECT_TIMEOUT in $lib/wallet/client)
const RECONNECT_SETTLE_TIMEOUT = 15_000;

/**
 * Regression tests for a wallet that was connected on a previous visit.
 *
 * wagmi persists the connection to localStorage with a partial connector (`{ id, name, type, uid }`)
 * and swaps in a live connector on `reconnect()`. When the injected provider never answers,
 * `reconnect()` never finishes: the page kept reporting the persisted address (rendering
 * "Pending deposit" / "Cancel deposit") while every write failed with
 * `connector.getChainId is not a function`, and the user had no way to reconnect.
 */
test.describe('wallet reconnect from persisted Rabby connection', () => {
	test('resets to disconnected when the wallet extension never responds, so the user can reconnect', async ({
		page
	}) => {
		await installMockRabby(page, { address: ADDRESS, chainId: POLYGON, persistedConnection: true, hang: true });
		await page.goto(STRATEGY);

		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toBeVisible();

		// wagmi tried to restore the session through the (hung) Rabby provider
		await expect.poll(() => getMockRabbyRequests(page)).toContain('eth_accounts');

		// the stale connection is dropped instead of lingering in `reconnecting` forever
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'disconnected', {
			timeout: RECONNECT_SETTLE_TIMEOUT
		});
		await expect(myDeposits.getByText('Wallet not connected')).toBeVisible();
		await expect(myDeposits.getByText('Pending deposit')).toHaveCount(0);
		await expect(myDeposits.getByRole('button', { name: 'Cancel deposit' })).toHaveCount(0);

		// the user is offered a fresh connection; the wizard must not treat the stale address as connected
		await myDeposits.getByRole('link', { name: 'Connect wallet' }).click();
		await expect(page).toHaveURL(/\/connect-wallet\/introduction$/);
		await page.getByRole('button', { name: 'Next' }).click();
		await expect(page).toHaveURL(/\/connect-wallet\/connect$/);
		await expect(page.getByRole('button', { name: 'Connect wallet' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
	});

	test('restores the connection when the wallet extension responds', async ({ page }) => {
		// keep the test hermetic: on-chain balance reads must not reach a public RPC
		await page.route(
			(url) => url.hostname !== '127.0.0.1',
			(route) => route.abort()
		);

		await installMockRabby(page, { address: ADDRESS, chainId: POLYGON, persistedConnection: true });
		await page.goto(STRATEGY);

		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'connected', {
			timeout: RECONNECT_SETTLE_TIMEOUT
		});
		await expect(myDeposits.getByText('Wallet not connected')).toHaveCount(0);
		await expect(myDeposits.getByRole('link', { name: 'Deposit', exact: true })).toBeEnabled();

		const requests = await getMockRabbyRequests(page);
		expect(requests).toContain('eth_accounts');
		expect(requests).toContain('eth_chainId');
	});
});
