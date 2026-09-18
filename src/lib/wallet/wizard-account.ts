import { redirect } from '@sveltejs/kit';
import { getAccount } from '@wagmi/core';
import { config } from '$lib/wallet/client';

/**
 * The wallet address a wizard step's `load` may query balances for, or a redirect to the wizard's
 * connect step if there is none.
 *
 * Wizard steps after "connect" are only reachable with a connected wallet, but the wizard is
 * `ssr = false` and remembers progress in sessionStorage, so a refresh runs the step's `load`
 * during client start-up. wagmi has hydrated its persisted session by then but not necessarily
 * reconnected it: `getAccount()` reports the persisted address while the status is still
 * `connecting`/`reconnecting`. That address is good enough for the public balance reads these loads
 * do; whether the session actually comes back is decided by the wizard layout once the wallet has
 * settled.
 *
 * With *no* address (nothing persisted) there is nothing to read balances for and `getBalance`
 * would throw an `InvalidAddressError` straight into the error page, so redirect to the connect
 * step instead.
 *
 * @param strategyId - the strategy the wizard belongs to
 * @param slug - the wizard's route segment (`deposit`, `redeem`, `connect-wallet`)
 */
export function getWizardAccount(strategyId: string, slug: string): Address {
	const { address } = getAccount(config);
	if (!address) redirect(307, `/strategies/${strategyId}/${slug}/connect`);
	return address;
}
