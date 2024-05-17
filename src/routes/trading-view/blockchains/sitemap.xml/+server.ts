/**
 * Generate sitemap with entries for each chain
 */
import { SitemapStream } from 'sitemap';
import { fetchPublicApi } from '$lib/helpers/public-api.js';

const chainPages = ['', 'exchanges', 'lending', 'tokens', 'trading-pairs'];
const path = 'trading-view';
const priority = 0.8;

export async function GET({ fetch, setHeaders, url, route }) {
	const chains = await fetchPublicApi(fetch, 'chains');

	const stream = new SitemapStream({ hostname: url.origin });

	for (const { chain_slug } of chains) {
		for (const page of chainPages) {
			const url = [path, chain_slug, page].filter(Boolean).join('/');
			stream.write({ url, priority });
		}
	}

	stream.end();

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=600'
	});

	// coerce stream to ReadableStream to make TypeScript happy
	return new Response(stream as unknown as ReadableStream<Uint8Array>);
}
