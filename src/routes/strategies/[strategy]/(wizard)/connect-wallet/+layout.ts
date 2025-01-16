import { error } from '@sveltejs/kit';
import { navigating } from '$app/state';
import { get } from 'svelte/store';
import { wizard } from '$lib/wizard/store';

const slug = 'connect-wallet';

const title = 'Connect wallet';

const steps = [
	{ slug: 'introduction', label: 'Introduction' },
	{ slug: 'connect', label: 'Connect your wallet' },
	{ slug: 'balance', label: 'Wallet balance' },
	{ slug: 'success', label: 'Success' }
] as const;

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
