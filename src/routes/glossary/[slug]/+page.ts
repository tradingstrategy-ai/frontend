/**
 * Load the server-side glossary dictionary and extract one term out of it.
 *
 * The glossary data is cached on CloudFlare is frequently accessed.
 */
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params, parent }) => {
	const { glossary } = await parent();

	const term = glossary[params.slug];

	if (!term) {
		throw error(404, `Term not found: ${params.slug}`);
	}

	return {
		term
	};
}) satisfies PageLoad;
