import { error } from '@sveltejs/kit';

export async function load({ parent }) {
	const { deferred } = await parent();
	const state = await deferred.state;

	if (!state) {
		throw error(503, 'Error loading strategy state');
	}

	return { state };
}
