/**
 * Generate sitemap with entries for each chain
 */
import { SitemapStream } from 'sitemap';
import { chains } from '$lib/helpers/chain';

const path = 'trading-view';
const priority = 0.8;

export async function GET({ fetch, setHeaders, url, route }) {
	const stream = new SitemapStream({ hostname: url.origin });

	for (const chain of chains) {
		const chainUrl = `${path}/${chain.slug}`;
		stream.write({ url: chainUrl, priority });

		const pages = chain.hasBackendData ? ['exchanges', 'lending', 'tokens', 'trading-pairs', 'vaults'] : ['vaults'];

		for (const page of pages) {
			const url = `${chainUrl}/${page}`;
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
