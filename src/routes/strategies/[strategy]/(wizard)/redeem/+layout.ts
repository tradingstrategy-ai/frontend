import type { GetTokenBalanceReturnType, TokenInfo } from '$lib/eth-defi/helpers';
import { navigating } from '$app/state';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { wizard } from '$lib/wizard/store';

const slug = 'redeem';

const title = 'Redeem tokens';

const steps = [
	{ slug: 'introduction', label: 'Introduction' },
	{ slug: 'connect', label: 'Connect your wallet' },
	{ slug: 'deposit-status', label: 'Deposit status' },
	{ slug: 'shares-redemption', label: 'Shares redemption' },
	{ slug: 'success', label: 'Success' }
];

export type RedeemWizardData = {
	nativeCurrency?: GetTokenBalanceReturnType;
	denominationToken?: TokenInfo;
	vaultShares?: GetTokenBalanceReturnType;
	vaultNetValue?: GetTokenBalanceReturnType;
	transactionId?: Address;
	shares?: string;
};

export async function load() {
	const returnTo = navigating.from?.url.pathname;

	// if layout was navigated to, initialize the wizard store
	if (returnTo) {
		wizard.init(slug, returnTo);
	}

	if (get(wizard).slug !== slug) {
		error(400, 'Wizard not properly initialized');
	}

	return { title, steps, wizard };
}
