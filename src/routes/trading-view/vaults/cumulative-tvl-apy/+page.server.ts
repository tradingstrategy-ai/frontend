import { fetchLatestFredValue } from '$lib/fred';

export async function load() {
	return {
		savingsRate: await fetchLatestFredValue('SNDR')
	};
}
