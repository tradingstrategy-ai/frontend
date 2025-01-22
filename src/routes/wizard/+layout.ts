import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { wizard } from '$lib/wizard/store';

export const ssr = false;

export async function load({ route }) {
	// route format: /wizard/[wizard-slug]/[step-slug]
	const wizardSlug = route.id.split('/')[2];

	if (get(wizard).slug !== wizardSlug) {
		error(400, 'Wizard not properly initialized');
	}

	return {
		skipNavbar: true,
		skipFooter: true
	};
}
