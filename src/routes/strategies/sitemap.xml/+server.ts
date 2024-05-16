/**
 * Generate a sitemap for strategy pages (live strategies only)
 */
import { SitemapStream } from 'sitemap';
import { getCachedStrategies } from 'trade-executor/strategy/runtime-state';

// see StrategyNav menuOptions
// also see special-case vault and backtest pages below
const strategyPages = [
	'',
	'description',
	'open-positions',
	'closed-positions',
	'performance',
	'fees',
	'netflow',
	'source',
	'tech-details'
];

const basePath = 'strategies';
const priority = 0.8;

export async function GET({ fetch, setHeaders, url }) {
	const strategies = await getCachedStrategies(fetch);

	const stream = new SitemapStream({ hostname: url.origin });

	for (const strategy of strategies) {
		if (!strategy.tags?.includes('live')) continue;

		const lastmod = strategy.summary_statistics?.calculated_at;
		const pages = [...strategyPages];

		if (strategy.on_chain_data?.asset_management_mode === 'enzyme') {
			pages.push('vault');
		}

		if (strategy.backtest_available) {
			pages.push('backtest');
		}

		for (const page of pages) {
			const url = [basePath, strategy.id, page].filter(Boolean).join('/');
			stream.write({ url, lastmod, priority });
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
