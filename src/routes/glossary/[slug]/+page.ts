/**
 * Load the server-side glossary dictionary and extract one term out of it.
 *
 * The glossary data is cached on CloudFlare is frequently accessed.
 */
import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { glossary } = await parent();

	const entry = glossary[params.slug];

	if (!entry) {
		error(404, `Glossary entry not found: ${params.slug}`);
	}

	return { entry };
}
