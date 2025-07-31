import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';

export async function load({ parent }) {
	const { admin, strategy } = await parent();
	if (!admin) error(401, 'Unauthorized');

	let chartRegistry: any;

	try {
		const resp = await fetch(`${strategy.url}/chart-registry`);
		if (!resp.ok) throw await publicApiError(resp);
		chartRegistry = await resp.json();
	} catch (e) {
		const stack = [`Error loading data from URL: ${strategy.url}/status`, e.message];
		error(503, { message: 'Service Unavailable', stack });
	}

	return { chartRegistry };
}
