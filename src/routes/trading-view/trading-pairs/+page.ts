import type { PageLoad } from '../$types';
import { fetchPairs } from '$lib/explorer/pair-client';

export const load: PageLoad = async ({ fetch, url }) => {
	const { searchParams } = url;

	const urlParams = Object.fromEntries(searchParams.entries());
	return await fetchPairs(fetch, urlParams);
};
