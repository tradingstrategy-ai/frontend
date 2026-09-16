/**
 * Load the server-side glossary dictionary and extract one term out of it.
 *
 * Only the requested entry is returned to the page; see `loadGlossaryForPage`.
 */
import { error, redirect } from '@sveltejs/kit';
import { getGlossaryEntry, loadGlossaryForPage } from '../glossary';

export async function load({ params, fetch, setHeaders }) {
	const glossary = await loadGlossaryForPage(fetch, setHeaders);

	const entry = getGlossaryEntry(glossary, params.slug);

	if (!entry) {
		error(404, `Glossary entry not found: ${params.slug}`);
	}

	if (params.slug !== entry.slug) {
		redirect(301, `/glossary/${entry.slug}`);
	}

	return { entry };
}
