import { error } from '@sveltejs/kit';

// This route and sub-routes require chain to have backend data
export async function load({ parent }) {
	const { chain } = await parent();
	if (!chain.hasBackendData) error(404, 'Not Found');
}
