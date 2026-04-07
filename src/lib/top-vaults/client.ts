import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { fetchTopVaultsRaw } from './server-config';
import { type TopVaults, topVaultsSchema } from './schemas';

export async function fetchTopVaults(fetch: Fetch): Promise<TopVaults> {
	try {
		const raw = await fetchTopVaultsRaw(fetch);
		return topVaultsSchema.parse(raw);
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) throw e;
		console.error('Failed to fetch top vaults:', e);
		throw error(503, 'Top vaults service not configured');
	}
}
