/**
 * Generate a sitemap for static list of frontend pages
 */
import { SitemapStream } from 'sitemap';
import { Readable } from 'stream';

const pages = [
	'',
	'about',
	'api/explorer/',
	'blog',
	'community',
	'docs',
	'glossary',
	'newsletter',
	'search',
	'strategies',
	'trading-view',
	'trading-view/api',
	'trading-view/backtesting',
	'trading-view/blockchains',
	'trading-view/exchanges',
	'trading-view/lending-reserves',
	'trading-view/top-list',
	'trading-view/top-list/daily-up',
	'trading-view/top-list/daily-down',
	'trading-view/trading-pairs'
];

export async function GET({ setHeaders, url }) {
	const entries = pages.map((url) => ({ url, priority: 0.8 }));

	const stream = new SitemapStream({ hostname: url.origin });
	Readable.from(entries).pipe(stream);

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=600'
	});

	// coerce stream to ReadableStream to make TypeScript happy
	return new Response(stream as unknown as ReadableStream<Uint8Array>);
}
