import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { wizard } from './store.js';
import { fetchPublicApi } from '$lib/helpers/public-api';

export const ssr = false;

export async function load({ fetch, route }) {
	// route format: /wizard/[wizard-slug]/[step-slug]
	const wizardSlug = route.id.split('/')[2];

	if (get(wizard).slug !== wizardSlug) {
		throw error(400, 'Wizard not properly initialized');
	}

	const chains = fetchPublicApi(fetch, 'chains').catch((e) => {
		console.error(`Error fetching chains: ${e}`);
	});

	return {
		skipNavbar: true,
		skipFooter: true,
		chains
	};
}
