/**
 * Generate a sitemap for static pages and other sitemaps
 */
import type { RequestHandler } from './$types';

export const GET = (({ url }) => {
	let { protocol, host } = url;

	// TODO: configure adapter-node to use correct Cloudflare X-Forwarded- headers
	// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#origin-protocol_header-and-host_header
	if (!host || host === 'undefined') {
		host = 'tradingstrategy.ai';
		protocol = 'https:';
	}

	const baseUrl = `${protocol}//${host}`;

	const headers = {
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=600'
	};

	return new Response(render(baseUrl), { headers });
}) satisfies RequestHandler;

// This sitemap is manually maintained and page paths included here one by one
const staticPages = [
	'',
	'about',
	'trading-view',
	'trading-view/backtesting',
	'trading-view/exchanges',
	'trading-view/api',
	'trading-view/avalanche',
	'trading-view/avalanche/tokens',
	'trading-view/binance',
	'trading-view/binance/tokens',
	'trading-view/ethereum',
	'trading-view/ethereum/tokens',
	'trading-view/polygon',
	'trading-view/polygon/tokens',
	'trading-view/blockchains',
	'trading-view/trading-pairs',
	'trading-view/top-list',
	'trading-view/top-list/daily-up',
	'trading-view/top-list/daily-down',
	'api/explorer/',
	'docs',
	'blog',
	'community',
	'search',
	'glossary',
	'newsletter',

	// refer to other sitemaps
	'blog/rss.xml',
	'docs/sitemap.xml',
	'api/sitemap/pairs/paged/0.xml',
	'api/sitemap/pairs/paged/1.xml',
	'api/sitemap/pairs/paged/2.xml',
	'api/sitemap/pairs/paged/3.xml',
	'api/sitemap/pairs/paged/4.xml',
	'api/sitemap/exchanges/sitemap.xml'
];

// See https://en.wikipedia.org/wiki/Sitemaps
const render = (baseUrl: string) => `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${renderFragments(baseUrl).join('')}
</urlset>`;

// Priority 0.8 = static page indexing preferred over token data
const renderFragments = (baseUrl: string) => {
	return staticPages.map((path) => {
		const fullUrl = `${baseUrl}/${path}`;
		return `<url><loc>${fullUrl}</loc><priority>0.8</priority></url>`;
	});
};
