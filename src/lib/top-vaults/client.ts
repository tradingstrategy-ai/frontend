import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { fetchTopVaultsRaw } from './server-config';
import { type TopVaults, topVaultsSchema } from './schemas';

function getSafeErrorSummary(errorValue: unknown): string {
	if (errorValue instanceof Error) {
		return `${errorValue.name}: ${errorValue.message}`;
	}
	return 'Unknown error';
}

export async function fetchTopVaults(fetch: Fetch): Promise<TopVaults> {
	try {
		const raw = await fetchTopVaultsRaw(fetch);
		return topVaultsSchema.parse(raw);
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) throw e;
		console.error(`Failed to fetch top vaults: ${getSafeErrorSummary(e)}`);
		throw error(503, 'Top vaults service not configured');
	}
}
