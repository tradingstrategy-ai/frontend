/**
 * Generate sitemap with entries for all vault pages, including individual vaults,
 * protocol/stablecoin/chain category pages, and static vault sub-pages.
 */
import { SitemapStream } from 'sitemap';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { isBlacklisted, resolveVaultDetails } from '$lib/top-vaults/helpers';
import { getChain } from '$lib/helpers/chain';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import { buildStablecoinMetadataLookup, resolveStablecoinSlug } from '$lib/stablecoin-metadata/helpers';

const basePath = 'trading-view/vaults';
const priority = 0.8;

const staticSubPages = [
	'all',
	'blacklisted',
	'high-tvl',
	'international',
	'new-vaults',
	'current-peak-tvl',
	'cumulative-tvl-apy',
	'yield-chain',
	'yield-protocol',
	'yield-risk'
];

export async function GET({ fetch, setHeaders, url }) {
	const [{ vaults, curators }, stablecoinIndex] = await Promise.all([
		fetchTopVaults(fetch),
		fetchStablecoinMetadataIndex(fetch)
	]);

	const stream = new SitemapStream({ hostname: url.origin });

	// Static vault sub-pages
	for (const page of staticSubPages) {
		stream.write({ url: `${basePath}/${page}`, priority });
	}

	const listedVaults = vaults.filter((v) => !isBlacklisted(v));

	// Individual vault detail pages
	for (const vault of listedVaults) {
		stream.write({ url: resolveVaultDetails(vault), priority });
	}

	// Protocol index + individual protocol pages. Protocol detail pages render
	// for any protocol with at least one listed vault, regardless of TVL.
	const protocolSlugs = new Set(listedVaults.map((v) => v.protocol_slug));
	stream.write({ url: `${basePath}/protocols`, priority });
	for (const slug of protocolSlugs) {
		stream.write({ url: `${basePath}/protocols/${slug}`, priority });
	}

	// Stablecoin index + individual stablecoin pages, using the same canonical
	// slug resolution as the stablecoins index page links (raw denomination
	// slugs may be aliases of a canonical metadata slug).
	const metadataLookup = buildStablecoinMetadataLookup(stablecoinIndex);
	const denominationSlugs = new Set<string>();
	for (const vault of listedVaults) {
		if (!vault.stablecoinish) continue;
		const slug =
			resolveStablecoinSlug(
				{ slug: vault.denomination_slug, symbol: vault.denomination, name: vault.normalised_denomination },
				metadataLookup
			) ?? vault.denomination_slug;
		if (slug) denominationSlugs.add(slug);
	}
	// Include zero-vault stablecoins from metadata index
	for (const meta of stablecoinIndex) {
		denominationSlugs.add(meta.slug);
	}
	stream.write({ url: `${basePath}/stablecoins`, priority });
	for (const slug of denominationSlugs) {
		stream.write({ url: `${basePath}/stablecoins/${slug}`, priority });
	}

	// Chain index + individual chain pages
	const chainSlugs = new Set(listedVaults.map((v) => getChain(v.chain_id)?.slug).filter(Boolean) as string[]);
	stream.write({ url: `${basePath}/chains`, priority });
	for (const slug of chainSlugs) {
		stream.write({ url: `${basePath}/chains/${slug}`, priority });
	}

	// Curator index + individual curator pages. The curator metadata map is the
	// source of truth: detail pages render for every curator in the map (even
	// with no eligible vaults) and 404 for slugs outside it.
	stream.write({ url: `${basePath}/curators`, priority });
	for (const slug of Object.keys(curators)) {
		stream.write({ url: `${basePath}/curators/${slug}`, priority });
	}

	stream.end();

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=600'
	});

	// coerce stream to ReadableStream to make TypeScript happy
	return new Response(stream as unknown as ReadableStream<Uint8Array>);
}
