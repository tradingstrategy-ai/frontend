import { fetchPublicApi } from '$lib/helpers/public-api';

export async function load({ fetch }) {
	// render the page even if the backend is down
	const impressiveNumbers = fetchPublicApi(fetch, 'impressive-numbers').catch((err) => {
		console.error('Request failed; rendering page without data.');
		console.error(err);
	});
	return { impressiveNumbers };
}
