import { expect, test, type Page } from '@playwright/test';
import { hangMockRabby, installMockRabby } from './mock-rabby';
import {
	ADDRESS,
	NATIVE_BALANCE_LABEL,
	POLYGON,
	RECONNECT_SETTLE_TIMEOUT,
	STRATEGY,
	TOKEN_BALANCE_LABEL,
	installStrategyRpc
} from './fixtures';

/**
 * Regression tests for the deposit wizard after a page refresh.
 *
 * The wizard is `ssr = false` and remembers completed steps in sessionStorage, so a refresh lands
 * the user straight back on e.g. the balance step. wagmi hydrates its persisted connection quickly
 * (so `getAccount().address` is available to the step's `load`), but that connection is a storage
 * stub until `reconnect()` has talked to the extension — which may be slow (cold service worker)
 * or never answer at all. Two things must hold:
 *
 * 1. a slow-but-healthy wallet must not bounce the user off the step they were on;
 * 2. a wallet that does not come back must send the user back to the connect step instead of
 *    leaving them on a step whose next action (a transaction) can only fail.
 */
test.describe('deposit wizard with a persisted Rabby connection', () => {
	/** Walk from the strategy page to the wizard's balance step with a healthy, connected wallet */
	async function gotoBalanceStep(page: Page) {
		await page.goto(STRATEGY);

		const myDeposits = page.locator('.my-deposits');
		await expect(myDeposits).toHaveAttribute('data-wallet-status', 'connected', { timeout: RECONNECT_SETTLE_TIMEOUT });

		await myDeposits.getByRole('link', { name: 'Deposit', exact: true }).click();
		await expect(page).toHaveURL(/\/deposit\/introduction$/);
		await page.getByRole('button', { name: 'Next' }).click();
		await expect(page).toHaveURL(/\/deposit\/connect$/);
		// connect step auto-completes because the restored session is on the right chain
		await page.getByRole('button', { name: 'Next' }).click();
		await expectBalanceStep(page);
	}

	async function expectBalanceStep(page: Page) {
		await expect(page).toHaveURL(/\/deposit\/balance$/);
		await expect(page.getByText(NATIVE_BALANCE_LABEL)).toBeVisible({ timeout: RECONNECT_SETTLE_TIMEOUT });
		await expect(page.getByText(TOKEN_BALANCE_LABEL)).toBeVisible();
	}

	test.beforeEach(async ({ page }) => {
		await installStrategyRpc(page);
	});

	test('stays on the balance step after a refresh while a slow wallet reconnects', async ({ page }) => {
		// slower than the strategy metadata fetch, so the step renders before wagmi is `connected`
		await installMockRabby(page, { address: ADDRESS, chainId: POLYGON, persistedConnection: true, responseDelay: 750 });
		await gotoBalanceStep(page);

		// wagmi is `connecting`/`reconnecting` for ~1.5s after this; the wizard must wait for it to
		// settle rather than treat "not connected yet" as "not connected"
		await page.reload();
		await expectBalanceStep(page);
		// the "Account" row only renders once wagmi reports `connected`, i.e. after the wallet settled
		await expect(page.getByText('Account')).toBeVisible();
		await expect(page).toHaveURL(/\/deposit\/balance$/);
	});

	test('sends the user back to the connect step after a refresh when the wallet does not come back', async ({
		page
	}) => {
		await installMockRabby(page, { address: ADDRESS, chainId: POLYGON, persistedConnection: true });
		await gotoBalanceStep(page);

		// the extension dies (persisted across the reload); wagmi can no longer restore the session
		await hangMockRabby(page);
		await page.reload();

		// the step renders (balances are public reads, the persisted address is enough) but once the
		// reconnect gives up the wizard must return to the connect step and offer a fresh connection,
		// since every later step needs a live connector to sign with
		await expect(page).toHaveURL(/\/deposit\/connect$/, { timeout: RECONNECT_SETTLE_TIMEOUT });
		await expect(page.getByRole('button', { name: 'Connect wallet' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
	});
});
