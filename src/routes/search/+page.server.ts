import { searchVaultEntities } from '$lib/search/vault-search.server';

const MAX_QUERY_LENGTH = 100;

export async function load({ fetch, url }) {
	const query = url.searchParams.get('q')?.trim() ?? '';
	if (!query) {
		return { query, results: [], total: 0, error: null };
	}
	if (query.length > MAX_QUERY_LENGTH) {
		return {
			query,
			results: [],
			total: 0,
			error: `Search queries must be ${MAX_QUERY_LENGTH} characters or fewer.`
		};
	}

	try {
		const response = await searchVaultEntities(fetch, query);
		return { ...response, error: null };
	} catch (error) {
		console.error('Search results could not be loaded:', error);
		return {
			query,
			results: [],
			total: 0,
			error: 'Search is temporarily unavailable. Please try again.'
		};
	}
}
