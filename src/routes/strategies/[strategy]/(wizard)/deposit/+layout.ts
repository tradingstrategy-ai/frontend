import type { EnzymeOnChainData } from 'trade-executor/schemas/summary';
import type { WizardStep } from '$lib/wizard/WizardActions.svelte';
import { navigating } from '$app/state';
import { error } from '@sveltejs/kit';
import { config } from '$lib/wallet/client';
import { get } from 'svelte/store';
import { wizard } from '$lib/wizard/store';
import { assertNotGeoBlocked } from '$lib/helpers/geo';
import { type GetTokenBalanceReturnType, getDenominationTokenInfo } from '$lib/eth-defi/helpers';

const slug = 'deposit';

const title = 'Deposit tokens';

const allSteps: WizardStep[] = [
	{ slug: 'introduction', label: 'Introduction' },
	{ slug: 'connect', label: 'Connect your wallet' },
	{ slug: 'balance', label: 'Wallet balance' },
	{ slug: 'tos', label: 'Terms of service' },
	{ slug: 'payment', label: 'Payment' },
	{ slug: 'success', label: 'Success' }
];

export type DepositWizardData = {
	denominationToken?: GetTokenBalanceReturnType;
	nativeCurrency?: GetTokenBalanceReturnType;
	tosSignature?: Address | '';
	tosHash?: Address;
};

export async function load({ parent }) {
	const { admin, ipCountry, chain, strategy } = await parent();
	assertNotGeoBlocked('strategies:deposit', ipCountry, admin);

	const returnTo = navigating.from?.url.pathname;

	// if layout was navigated to, initialize the wizard store
	if (returnTo) {
		wizard.init(slug, returnTo);
	}

	if (get(wizard).slug !== slug) {
		error(400, 'Wizard not properly initialized');
	}

	const onChainData = strategy.on_chain_data as EnzymeOnChainData;
	const { comptroller, terms_of_service } = onChainData.smart_contracts;

	let steps = structuredClone(allSteps);

	// skip "Terms of service" step if no terms_of_service contract
	if (!terms_of_service) {
		steps = steps.filter(({ slug }) => slug !== 'tos');
	}

	// get denomination token info
	const denominationTokenInfo = await getDenominationTokenInfo(config, { chainId: chain.id, comptroller });

	// USDC can forward payment using transferWithAuthorizations; other tokens can't (yet)
	const canForwardPayment = denominationTokenInfo.symbol === 'USDC';

	return { title, steps, wizard, denominationTokenInfo, canForwardPayment };
}
