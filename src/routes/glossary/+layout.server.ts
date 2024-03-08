/**
 * Data loader for all /glossary routes
 */
import { getCachedGlossary } from './glossary.js';

export async function load({ fetch, setHeaders }) {
	// Setting cache-control and age headers to limit re-fetching
	// of this resource by browser and reverse proxy / CDN
	setHeaders({
		'cache-control': `public, max-age=${getCachedGlossary.ttl}`,
		age: getCachedGlossary.getAge(fetch).toFixed(0)
	});

	return {
		glossary: await getCachedGlossary(fetch)
	};
}
