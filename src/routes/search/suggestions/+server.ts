import { json } from '@sveltejs/kit';
import { searchVaultEntities } from '$lib/search/vault-search.server';

const MAX_QUERY_LENGTH = 100;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

export async function GET({ fetch, url }) {
	const query = url.searchParams.get('q')?.trim() ?? '';
	const limitParameter = url.searchParams.get('limit');
	const requestedLimit = limitParameter === null ? DEFAULT_LIMIT : Number(limitParameter);
	const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), MAX_LIMIT) : DEFAULT_LIMIT;

	if (query.length > MAX_QUERY_LENGTH) {
		return json({ message: `Search queries must be ${MAX_QUERY_LENGTH} characters or fewer.` }, { status: 400 });
	}

	try {
		const response = await searchVaultEntities(fetch, query, limit, { diversifyTypes: true });
		return json(response, { headers: { 'cache-control': 'public, max-age=60' } });
	} catch (error) {
		console.error('Search suggestions could not be loaded:', error);
		return json({ message: 'Search is temporarily unavailable.' }, { status: 503 });
	}
}
