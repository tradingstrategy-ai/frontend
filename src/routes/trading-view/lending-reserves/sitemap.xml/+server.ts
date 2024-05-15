/**
 * Generate sitemap with entries for each lending reserve
 */
import { SitemapStream } from 'sitemap';
import { Readable } from 'stream';
import { fetchLendingReserves } from '$lib/explorer/lending-reserve-client';

export async function GET({ fetch, setHeaders, url }) {
	// Fetching all reserves (currently < 1000); may need to paginate in the future
	const reserves = await fetchLendingReserves(fetch, { page_size: 1000 });

	const stream = new SitemapStream({ hostname: url.origin });
	const entries = reserves!.rows.map((row) => ({
		url: `trading-view/${row.chain_slug}/lending/${row.protocol_slug}/${row.reserve_slug}`,
		priority: 0.8
	}));
	Readable.from(entries).pipe(stream);

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=600'
	});

	// coerce smStream to ReadableStream to make TypeScript happy
	return new Response(stream as unknown as ReadableStream<Uint8Array>);
}
