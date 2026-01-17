import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { topVaultsUrl } from '$lib/config';
import { type TopVaults, topVaultsSchema } from './schemas';

export async function fetchTopVaults(fetch: Fetch): Promise<TopVaults> {
	if (!topVaultsUrl) error(503, 'Top vaults service not configured');
	const resp = await fetch(topVaultsUrl);
	if (!resp.ok) throw await publicApiError(resp);
	return topVaultsSchema.parse(await resp.json());
}
