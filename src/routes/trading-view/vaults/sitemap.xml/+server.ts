/**
 * Generate sitemap with entries for each vault
 */
import { SitemapStream } from 'sitemap';
import type { SitemapItemLoose } from 'sitemap';
import { Readable } from 'stream';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { resolveVaultDetails } from '$lib/top-vaults/helpers';

async function getVaultEntries(fetch: Fetch, url: URL) {
	// Fetching all vaults (currently < 1000); may need to paginate in the future
	const { vaults } = await fetchTopVaults(fetch);

	return vaults.reduce((acc, vault) => {
		// skip if blacklisted or chain is not recognized
		if (vault.risk_numeric !== 999) {
			acc.push({
				url: resolveVaultDetails(vault),
				priority: 0.8
			});
		}

		return acc;
	}, [] as SitemapItemLoose[]);
}

export async function GET({ fetch, setHeaders, url }) {
	const entries = await getVaultEntries(fetch, url);
	const stream = new SitemapStream({ hostname: url.origin });
	Readable.from(entries).pipe(stream);

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=600'
	});

	// coerce smStream to ReadableStream to make TypeScript happy
	return new Response(stream as unknown as ReadableStream<Uint8Array>);
}
