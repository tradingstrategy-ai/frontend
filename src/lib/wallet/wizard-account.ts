import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
import { redirect } from '@sveltejs/kit';
import { getAccount } from '@wagmi/core';
import { config } from '$lib/wallet/client';

/**
 * The wallet address a wizard step's `load` may query balances for, or a redirect to the wizard's
 * connect step if there is none.
 *
 * Wizard steps after "connect" are only reachable with a connected wallet, but the wizard is
 * `ssr = false` and remembers progress in sessionStorage, so a refresh (or a deep link) runs the
 * step's `load` during client start-up. At that point wagmi has hydrated its persisted session but
 * has not necessarily reconnected it: `getAccount()` reports the persisted address (fine for the
 * public balance reads these loads do) with status `connecting`/`reconnecting`. That is deliberately
 * accepted here — whether the session actually comes back is decided later by the wizard layout,
 * which waits for `walletSettled` and sends the user to the connect step if it did not.
 *
 * What is not acceptable is *no* address: nothing persisted, so nothing to read balances for and
 * `getBalance` would throw an `InvalidAddressError` straight into the error page. Redirect to the
 * connect step instead.
 *
 * @param strategy - the strategy the wizard belongs to
 * @param slug - the wizard's route segment (`deposit`, `redeem`, `connect-wallet`)
 */
export function getWizardAccount(strategy: Pick<ConnectedStrategyInfo, 'id'>, slug: string): Address {
	const { address } = getAccount(config);
	if (!address) redirect(307, `/strategies/${strategy.id}/${slug}/connect`);
	return address;
}
