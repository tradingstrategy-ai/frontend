import { error } from '@sveltejs/kit';
import { topVaultsUrl, vaultSparklinesUrl } from '$lib/config';

const documentationUrl = 'https://tradingstrategy.ai/docs/overview/defi-vault-data.html';

type VaultDatasetDefinition = {
	/** Stable identifier used for list rendering and logging */
	id: string;
	/** Human-readable dataset name shown in the UI */
	name: string;
	/** Short summary of what the dataset contains */
	description: string;
	/** Download guidance shown alongside curl examples */
	instructions: string;
	/** Suggested local filename for saved downloads */
	filename: string;
	/** File format exposed to users */
	format: 'JSON' | 'Parquet';
	/** Canonical documentation page for the dataset */
	documentation: string;
	/** Public dataset URL used for metadata lookups and downloads */
	downloadUrl: string;
};

type VaultDataset = VaultDatasetDefinition & {
	size: number | null;
	lastUpdatedAt: string | null;
};

/**
 * Ensure a base URL ends with a trailing slash before joining paths.
 *
 * @param url Base URL that may or may not already include a trailing slash
 */
function ensureTrailingSlash(url: string): string {
	return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Convert an HTTP date header value to an ISO timestamp.
 *
 * Returns `null` for missing or invalid header values.
 *
 * @param value Raw HTTP header value, usually `Last-Modified`
 * @returns ISO timestamp string or `null` when parsing fails
 */
function parseHeaderDate(value: string | null): string | null {
	if (!value) return null;
	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

/**
 * Resolve file metadata for a configured vault dataset using an HTTP HEAD request.
 *
 * Falls back to `null` metadata values if the upstream request fails.
 *
 * @param fetch SvelteKit's fetch function
 * @param dataset Static vault dataset definition to enrich
 * @returns Dataset definition with resolved size and update timestamp
 */
async function resolveDatasetMetadata(fetch: Fetch, dataset: VaultDatasetDefinition): Promise<VaultDataset> {
	try {
		const response = await fetch(dataset.downloadUrl, { method: 'HEAD' });

		if (!response.ok) {
			throw new Error(`HEAD ${dataset.downloadUrl} failed with ${response.status} ${response.statusText}`);
		}

		const contentLength = response.headers.get('content-length');
		const size = contentLength ? Number.parseInt(contentLength, 10) : null;

		return {
			...dataset,
			size: Number.isFinite(size) ? size : null,
			lastUpdatedAt: parseHeaderDate(response.headers.get('last-modified'))
		};
	} catch (err) {
		console.error(`Failed to resolve metadata for vault dataset ${dataset.id}:`, err);

		return {
			...dataset,
			size: null,
			lastUpdatedAt: null
		};
	}
}

/**
 * Build the vault datasets page payload.
 *
 * Defines the frontend-owned dataset catalogue and enriches each entry with
 * server-side freshness metadata from the upstream storage bucket.
 *
 * @param fetch SvelteKit's fetch function
 * @param setHeaders SvelteKit header setter for cache-control
 */
export async function load({ fetch, setHeaders }) {
	if (!topVaultsUrl || !vaultSparklinesUrl) {
		throw error(503, 'Vault datasets are not configured');
	}

	const datasets: VaultDatasetDefinition[] = [
		{
			id: 'vault-metadata',
			name: 'Vault metadata',
			description:
				'Summary JSON for tracked vaults, including identity, chain, protocol, performance, fees and status fields.',
			instructions:
				'Download the summary JSON when you need the latest vault catalogue, rankings, and descriptive fields for offline research or your own pipelines.',
			filename: 'vault-metadata.json',
			format: 'JSON',
			documentation: documentationUrl,
			downloadUrl: topVaultsUrl
		},
		{
			id: 'vault-prices',
			name: 'Vault prices',
			description:
				'Share price, TVL history in Parquet format, suitable for offline analysis, chart generation, and backtesting-style workflows.',
			instructions:
				'Download the hourly Parquet file to analyse historical vault performance locally or to feed your own notebooks and research jobs.',
			filename: 'vault-history.parquet',
			format: 'Parquet',
			documentation: documentationUrl,
			downloadUrl: new URL('cleaned-vault-prices-1h.parquet', ensureTrailingSlash(vaultSparklinesUrl)).toString()
		}
	];

	setHeaders({
		'cache-control': 'public, max-age=600'
	});

	return {
		datasets: await Promise.all(datasets.map((dataset) => resolveDatasetMetadata(fetch, dataset)))
	};
}
