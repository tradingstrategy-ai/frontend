import { expect, test } from '@playwright/test';
import { installMockRabby, getMockRabbyRequests, releaseMockRabby } from './mock-rabby';
import { ADDRESS, MAINNET, POLYGON, RECONNECT_SETTLE_TIMEOUT, STRATEGY, installStrategyRpc } from './fixtures';

/**
 * Regression tests for restoring a wallet session persisted on a previous visit.
 *
 * wagmi persists the connection with a partial connector (`{ id, name, type, uid }`) and swaps in
 * a live one on `reconnect()`. When the extension never answered, `reconnect()` never finished:
 * the page kept reporting the persisted address (rendering "Pending deposit" with a "Cancel
 * deposit" button) while every write failed with `connector.getChainId is not a function`, and
 * nothing offered the user a way to reconnect.
 */
test.describe('wallet reconnect from persisted Rabby connection', () => {
	test.beforeEach(async ({ page }) => {
		await installStrategyRpc(page);
	});

	test('resets to disconnected when the wallet extension never responds, so the user can reconnect', async ({
		page
	}) => {
		await installMockRabby(page, { address: ADDRESS, chainId: POLYGON, persistedConnection: true, hang: true });
		await page.goto(STRATEGY);

		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toBeVisible();

		// wagmi tried to restore the session through the (hung) Rabby provider
		await expect.poll(() => getMockRabbyRequests(page)).toContain('eth_accounts');

		// the stale connection is dropped instead of lingering unsettled forever
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

	test('connects when the wallet extension answers only after the reconnect timeout', async ({ page }) => {
		await installMockRabby(page, { address: ADDRESS, chainId: POLYGON, persistedConnection: true, hang: true });
		await page.goto(STRATEGY);

		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'disconnected', {
			timeout: RECONNECT_SETTLE_TIMEOUT
		});

		// the extension wakes up and answers the `eth_accounts` request wagmi has been waiting on.
		// wagmi's reconnect() then finishes and stores the live connection, but on its own it only
		// promotes the status from `reconnecting`/`connecting` — after the reset to `disconnected`
		// the page would keep saying "Wallet not connected" while a live connection sits in the store
		await releaseMockRabby(page);
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'connected');
		await expect(myDeposits.getByText('Wallet not connected')).toHaveCount(0);
	});

	test('does not leave an unhandled rejection when the user declines a network switch', async ({ page }) => {
		const pageErrors: string[] = [];
		page.on('pageerror', (error) => pageErrors.push(error.message));

		// session restored on Ethereum mainnet while the strategy lives on Polygon
		await installMockRabby(page, {
			address: ADDRESS,
			chainId: MAINNET,
			persistedConnection: true,
			rejectChainSwitch: true
		});
		await page.goto(STRATEGY);

		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'connected', { timeout: RECONNECT_SETTLE_TIMEOUT });
		await expect(myDeposits.getByText('Wrong network')).toBeVisible();

		// the wallet prompts to switch and the user dismisses the prompt
		await myDeposits.getByRole('button', { name: 'Switch network' }).click();
		await expect.poll(() => getMockRabbyRequests(page)).toContain('wallet_switchEthereumChain');

		// still on the wrong network, and the rejection was handled rather than escaping as an
		// uncaught `UserRejectedRequestError`
		await expect(myDeposits.getByText('Wrong network')).toBeVisible();
		await page.waitForTimeout(500);
		expect(pageErrors).toEqual([]);
	});
});
