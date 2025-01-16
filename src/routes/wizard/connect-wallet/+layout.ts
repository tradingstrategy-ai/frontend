import { error } from '@sveltejs/kit';
import { navigating } from '$app/state';
import { get } from 'svelte/store';
import { wizard } from '$lib/wizard/store';

export const ssr = false;

export type ConnectWizardData = {
	chainId: number;
	strategyName: string;
	token: Address;
};

export async function load({ url }) {
	const wizardSlug = 'connect-wallet';
	const returnTo = navigating.from?.url.pathname;

	// TODO: is there a better way to know this is "first load"?
	// if layout was navigated to, initialize the wizard store
	if (returnTo && !returnTo.startsWith('/wizard')) {
		const chainId = Number(url.searchParams.get('chainId'));
		const strategyName = url.searchParams.get('strategyName');
		if (!(chainId && strategyName)) {
			error(400, 'Wizard not properly initialized');
		}
		wizard.init(wizardSlug, returnTo, { chainId, strategyName });
	}

	if (get(wizard).slug !== wizardSlug) {
		error(400, 'Wizard not properly initialized');
	}

	return {
		skipNavbar: true,
		skipFooter: true,

		title: 'Connect wallet',
		steps: [
			{ slug: 'introduction', label: 'Introduction' },
			{ slug: 'connect', label: 'Connect your wallet' },
			{ slug: 'balance', label: 'Wallet balance' },
			{ slug: 'success', label: 'Success' }
		],

		wizard
	};
}
