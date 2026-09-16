/**
 * Data loader for the glossary index.
 *
 * Returns only the slug and name of each term: the index renders links, and the full
 * glossary (definitions included) would be serialised into the page HTML otherwise.
 */
import { loadGlossaryForPage } from './glossary';

export async function load({ fetch, setHeaders }) {
	const glossary = await loadGlossaryForPage(fetch, setHeaders);

	const terms = Object.values(glossary).map(({ slug, name }) => ({ slug, name }));

	return { terms };
}
