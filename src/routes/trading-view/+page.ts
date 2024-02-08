import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ fetch }) {
	try {
		const impressiveNumbers = await fetchPublicApi(fetch, 'impressive-numbers');
		return { impressiveNumbers };
	} catch (e) {
		console.error('Request failed; rendering page without data.');
		console.error(e);
	}
}
