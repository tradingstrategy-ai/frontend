/**
 * Load the server-side glossary dictionary and extract one term out of it.
 *
 * The glossary data is cached on CloudFlare is frequently accessed.
 */
import { error, redirect } from '@sveltejs/kit';
import { getGlossaryEntry } from '../glossary';

export async function load({ params, parent }) {
	const { glossary } = await parent();

	const entry = getGlossaryEntry(glossary, params.slug);

	if (!entry) {
		error(404, `Glossary entry not found: ${params.slug}`);
	}

	if (params.slug !== entry.slug) {
		redirect(301, `/glossary/${entry.slug}`);
	}

	return { entry };
}
