/**
 * Data loader for all /glossary routes
 */
import { error } from '@sveltejs/kit';
import { getCachedGlossary, GlossaryParseError } from './glossary.js';

export async function load({ fetch, setHeaders }) {
	let glossary;

	try {
		glossary = await getCachedGlossary(fetch);
	} catch (e) {
		if (e instanceof GlossaryParseError) {
			error(503, {
				message: 'Service Unavailable',
				stack: e.stack?.split('\n')
			});
		}
		throw e;
	}

	// Setting cache-control and age headers to limit re-fetching
	// of this resource by browser and reverse proxy / CDN
	setHeaders({
		'cache-control': `public, max-age=${getCachedGlossary.ttl}`,
		age: getCachedGlossary.getAge(fetch).toFixed(0)
	});

	return { glossary };
}
