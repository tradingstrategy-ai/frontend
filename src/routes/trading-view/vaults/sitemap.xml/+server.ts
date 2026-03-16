/**
 * Generate sitemap with entries for all vault pages, including individual vaults,
 * protocol/stablecoin/chain category pages, and static vault sub-pages.
 */
import { SitemapStream } from 'sitemap';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { isBlacklisted, meetsMinTvl, resolveVaultDetails } from '$lib/top-vaults/helpers';
import { getChain } from '$lib/helpers/chain';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';

const basePath = 'trading-view/vaults';
const priority = 0.8;

const staticSubPages = [
	'all',
	'high-tvl',
	'new-vaults',
	'current-peak-tvl',
	'cumulative-tvl-apy',
	'yield-chain',
	'yield-protocol',
	'yield-risk'
];

export async function GET({ fetch, setHeaders, url }) {
	const [{ vaults }, stablecoinIndex] = await Promise.all([fetchTopVaults(fetch), fetchStablecoinMetadataIndex(fetch)]);

	const stream = new SitemapStream({ hostname: url.origin });

	// Static vault sub-pages
	for (const page of staticSubPages) {
		stream.write({ url: `${basePath}/${page}`, priority });
	}

	// Individual vault detail pages
	for (const vault of vaults) {
		if (!isBlacklisted(vault)) {
			stream.write({ url: resolveVaultDetails(vault), priority });
		}
	}

	const eligibleVaults = vaults.filter((v) => !isBlacklisted(v) && meetsMinTvl(v));

	// Protocol index + individual protocol pages
	const protocolSlugs = new Set(eligibleVaults.map((v) => v.protocol_slug));
	stream.write({ url: `${basePath}/protocols`, priority });
	for (const slug of protocolSlugs) {
		stream.write({ url: `${basePath}/protocols/${slug}`, priority });
	}

	// Stablecoin index + individual stablecoin pages
	const denominationSlugs = new Set(eligibleVaults.filter((v) => v.stablecoinish).map((v) => v.denomination_slug));
	// Include zero-vault stablecoins from metadata index
	for (const meta of stablecoinIndex) {
		denominationSlugs.add(meta.slug);
	}
	stream.write({ url: `${basePath}/stablecoins`, priority });
	for (const slug of denominationSlugs) {
		stream.write({ url: `${basePath}/stablecoins/${slug}`, priority });
	}

	// Chain index + individual chain pages
	const chainSlugs = new Set(eligibleVaults.map((v) => getChain(v.chain_id)?.slug).filter(Boolean) as string[]);
	stream.write({ url: `${basePath}/chains`, priority });
	for (const slug of chainSlugs) {
		stream.write({ url: `${basePath}/chains/${slug}`, priority });
	}

	stream.end();

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=600'
	});

	// coerce stream to ReadableStream to make TypeScript happy
	return new Response(stream as unknown as ReadableStream<Uint8Array>);
}
