import type { LayoutLoad } from './$types';
import { chainsUnderMaintenance } from '$lib/config';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = ({ params }) => {
	// Check chain maintenance status; if under maintenance, trigger error (see +error.svelte)
	const chainName = chainsUnderMaintenance[<string>params.chain];
	if (chainName) {
		throw error(503, `Chain under maintenance: ${chainName}`);
	}
};
