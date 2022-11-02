import type { LayoutLoad } from './$types';
import { chainsUnderMaintenance } from '$lib/config';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = ({ params }) => {
	// trigger error if chain is under maintenance
	const chainName = chainsUnderMaintenance[params.chain];
	if (chainName) {
		throw error(503, { chainName, message: `Chain under maintenance: ${chainName}` });
	}
};
