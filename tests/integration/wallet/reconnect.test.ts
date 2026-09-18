import { expect, test, type Page } from '@playwright/test';
import { installMockRabby, getMockRabbyAnswers, getMockRabbyRequests, releaseMockRabby } from './mock-rabby';
import {
	ADDRESS,
	MAINNET,
	OTHER_ADDRESS,
	POLYGON,
	RECONNECT_SETTLE_TIMEOUT,
	STRATEGY,
	installStrategyRpc
} from './fixtures';

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

	/**
	 * Let Rabby answer what it has queued, then give the page time to react. The assertions that
	 * follow are negative ("nothing changed"), so this has to be a bounded wait: first until the
	 * wallet has answered everything it was asked — a reconnect that did land would issue further
	 * requests, so this only settles once the flow is idle — then a fixed grace period for wagmi and
	 * AppKit to process the last answer.
	 */
	async function wakeRabby(page: Page) {
		await releaseMockRabby(page);
		await expect
			.poll(async () => {
				const [requests, answers] = await Promise.all([getMockRabbyRequests(page), getMockRabbyAnswers(page)]);
				return answers.includes('eth_accounts') && answers.length === requests.length;
			})
			.toBe(true);
		await page.waitForTimeout(500);
	}

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

	test('lets the user reconnect through the modal when the extension answers only after the timeout', async ({
		page
	}) => {
		await installMockRabby(page, { address: ADDRESS, chainId: POLYGON, persistedConnection: true, hang: true });
		await page.goto(STRATEGY);

		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'disconnected', {
			timeout: RECONNECT_SETTLE_TIMEOUT
		});

		// the extension wakes up and answers the `eth_accounts` wagmi's abandoned reconnect() has been
		// waiting on. That reconnect must not land: wagmi would make it the current connection and
		// AppKit would treat it as a wallet switch (see `abandonReconnect` in $lib/wallet/client)
		await wakeRabby(page);
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'disconnected');

		// but the wallet is usable again, so connecting it from the modal works
		await myDeposits.getByRole('link', { name: 'Connect wallet' }).click();
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Connect wallet' }).click();
		await page.getByText('Rabby Wallet', { exact: true }).click();
		await expect(page.locator('.connect-wallet .is-connected')).toContainText(ADDRESS.slice(-6));
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

		// the wallet has delivered the rejection; give the page one more task for it to propagate
		await expect.poll(() => getMockRabbyAnswers(page)).toContain('wallet_switchEthereumChain');
		await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));

		// still on the wrong network, and the rejection was handled rather than escaping as an
		// uncaught `UserRejectedRequestError`
		await expect(myDeposits.getByText('Wrong network')).toBeVisible();
		expect(pageErrors).toEqual([]);
	});

	/**
	 * With Rabby hung and dropped after the timeout, connect "Test Wallet" through the AppKit modal
	 * from the connect-wallet wizard (reached from "My deposits": a link on desktop, a header button
	 * on mobile), and return the connect step's account widget.
	 */
	async function connectOtherWallet(page: Page, layout: 'desktop' | 'mobile') {
		await installMockRabby(page, {
			address: ADDRESS,
			chainId: POLYGON,
			persistedConnection: true,
			hang: true,
			secondWalletAddress: OTHER_ADDRESS
		});
		await page.goto(STRATEGY);

		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'disconnected', {
			timeout: RECONNECT_SETTLE_TIMEOUT
		});

		await myDeposits.getByRole(layout === 'desktop' ? 'link' : 'button', { name: 'Connect wallet' }).click();
		await page.getByRole('button', { name: 'Next' }).click();
		await expect(page).toHaveURL(/\/connect-wallet\/connect$/);
		await page.getByRole('button', { name: 'Connect wallet' }).click();
		// AppKit modal (web components; Playwright locators pierce the shadow DOM)
		await page.getByText('Test Wallet', { exact: true }).click();

		const account = page.locator('.connect-wallet .is-connected');
		await expect(account).toContainText(OTHER_ADDRESS.slice(-6));
		return account;
	}

	test('keeps the wallet the user connected meanwhile when the hung extension answers late', async ({ page }) => {
		const account = await connectOtherWallet(page, 'desktop');

		// Rabby wakes up. Left alone, wagmi's pending reconnect() would replace the connections map
		// with Rabby's connection and make it current, and AppKit would then disconnect Test Wallet
		// as the "previous" wallet — silently switching accounts
		await wakeRabby(page);

		await expect(account).toContainText(OTHER_ADDRESS.slice(-6));
		await expect(account).not.toContainText(ADDRESS.slice(-6));
	});

	test('stays disconnected after the user disconnects, even if the hung extension answers late', async ({ page }) => {
		// the "Disconnect wallet" button only exists in the mobile layout of "My deposits"
		await page.setViewportSize({ width: 390, height: 844 });
		await connectOtherWallet(page, 'mobile');

		// back to the strategy page by client-side navigation: a full load would take the pending
		// reconnect() down with the page, and the point is that it is still pending
		await page.getByRole('button', { name: 'Cancel' }).click();
		await expect(page).toHaveURL(new RegExp(`${STRATEGY}$`));
		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'connected');
		await myDeposits.getByRole('button', { name: 'My deposits' }).click();
		await myDeposits.getByRole('button', { name: 'Disconnect wallet' }).click();
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'disconnected');

		// Rabby wakes up after the user chose to have no wallet connected; its late connection must
		// not land
		await wakeRabby(page);
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'disconnected');
	});

	test('does not keep a stale connection from a connector that answers after a live session was settled', async ({
		page
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		// Test Wallet's session is restored at once; wagmi then probes hung Rabby and never finishes,
		// so the timeout settles the live Test Wallet connection as connected
		await installMockRabby(page, {
			address: ADDRESS,
			chainId: POLYGON,
			persistedConnection: 'second',
			secondWalletAddress: OTHER_ADDRESS,
			hang: true
		});
		await page.goto(STRATEGY);
		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'connected', { timeout: RECONNECT_SETTLE_TIMEOUT });

		const disconnect = async () => {
			await myDeposits.getByRole('button', { name: 'My deposits' }).click();
			await myDeposits.getByRole('button', { name: 'Disconnect wallet' }).click();
			await expect(myDeposits).toHaveAttribute('data-wallet-status', 'disconnected');
		};
		await disconnect();

		// Rabby wakes up. Left alone, wagmi's still-running reconnect() would append Rabby as a
		// non-current connection; wagmi's disconnect() "switches over" to whatever connection is left,
		// so the next connect/disconnect cycle would end up connected to Rabby instead of disconnected
		await wakeRabby(page);

		await myDeposits.getByRole('button', { name: 'Connect wallet' }).click();
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Connect wallet' }).click();
		await page.getByText('Test Wallet', { exact: true }).click();
		await expect(page.locator('.connect-wallet .is-connected')).toContainText(OTHER_ADDRESS.slice(-6));
		await page.getByRole('button', { name: 'Cancel' }).click();
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'connected');

		await disconnect();
	});
});
