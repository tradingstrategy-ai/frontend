import type { PageLoad } from '../$types';
import { backendUrl } from '$lib/config';
import { publicApiError } from '$lib/helpers/publicApiError';

// https://tradingstrategy.ai/api/explorer/#/Trading%20pair/web_pairs
const apiUrl = `${backendUrl}/pairs`;

export const load: PageLoad = async ({ fetch, url }) => {
	const { searchParams } = url;
	const page = Number(searchParams.get('page')) || 0;
	const sort = searchParams.get('sort') || 'volume_30d';
	const direction = searchParams.get('direction') || 'desc';

	const apiParams = new URLSearchParams({
		page_size: '10',
		page: page.toString(),
		sort,
		direction
	});

	const resp = await fetch(`${apiUrl}?${apiParams}`);

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	const data = await resp.json();

	return {
		rows: data.results,
		totalRowCount: data.total,
		page,
		sort,
		direction
	};
};
