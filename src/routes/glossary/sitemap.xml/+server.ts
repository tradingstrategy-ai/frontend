/**
 * Generate a sitemap for glossary only.
 *
 * - All glossary terms are boosted to crawling priority 1.0
 */
import { SitemapStream } from 'sitemap';
import { Readable } from 'stream';
import { getCachedGlossary } from '../glossary.js';

export async function GET({ fetch, setHeaders, url }) {
	const glossary = await getCachedGlossary(fetch);

	const stream = new SitemapStream({ hostname: url.origin });
	const entries = Object.keys(glossary).map((slug) => ({
		url: `glossary/${slug}`,
		priority: 1.0
	}));
	Readable.from(entries).pipe(stream);

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': `public, max-age=${getCachedGlossary.ttl}`,
		age: getCachedGlossary.getAge(fetch).toFixed(0)
	});

	// coerce stream to ReadableStream to make TypeScript happy
	return new Response(stream as unknown as ReadableStream<Uint8Array>);
}
