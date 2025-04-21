import { error } from '@sveltejs/kit';

export async function load({ parent }) {
	const { deferred } = await parent();
	const strategyState = await deferred.state;

	if (!strategyState) {
		error(503, 'Error loading strategy state');
	}

	return { strategyState };
}
