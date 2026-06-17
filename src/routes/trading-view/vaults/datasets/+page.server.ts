import { error } from '@sveltejs/kit';
import { headTopVaults, headVaultPrices } from '$lib/top-vaults/server-config';
import { isR2Configured } from '$lib/r2/client';
import { vaultProtocolMetadataUrl } from '$lib/config';

const documentationUrl = 'https://tradingstrategy.ai/docs/overview/defi-vault-data.html';

/** Origin of the public CDN that hosts the free sample files (host kept server-side). */
const sampleBaseUrl = vaultProtocolMetadataUrl ? new URL(vaultProtocolMetadataUrl).origin : undefined;

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
	/** Public-facing download URL (points to our proxy, not the CDN) */
	downloadUrl: string;
	/** Free sample — downloadable without an API key (proxied via /api) */
	free?: boolean;
	/** CDN object name used server-side to read freshness metadata for samples */
	sampleFile?: string;
};

type VaultDataset = VaultDatasetDefinition & {
	size: number | null;
	lastUpdatedAt: string | null;
};

const SAMPLE_DESCRIPTION = 'Limited data sample covering only vaults on the Ethereum blockchain';

/**
 * HEAD a public sample file to read its size and last-modified date.
 * Degrades to nulls on any failure so the page still renders.
 */
async function headSample(fetch: typeof globalThis.fetch, file: string) {
	if (!sampleBaseUrl) return { size: null, lastModified: null };
	try {
		const res = await fetch(`${sampleBaseUrl}/${file}`, { method: 'HEAD' });
		if (!res.ok) return { size: null, lastModified: null };
		const len = res.headers.get('content-length');
		const lastModified = res.headers.get('last-modified');
		return {
			size: len ? Number(len) : null,
			lastModified: lastModified ? new Date(lastModified) : null
		};
	} catch {
		return { size: null, lastModified: null };
	}
}

/**
 * Build the vault datasets page payload.
 *
 * Defines the frontend-owned dataset catalogue and enriches each entry with
 * server-side freshness metadata (R2 for the licensed datasets, the public CDN
 * for the free samples).
 */
export async function load({ fetch, setHeaders, url }) {
	if (!isR2Configured()) {
		throw error(503, 'Vault datasets are not configured — R2 credentials missing');
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
			downloadUrl: '/trading-view/vaults/datasets/download/vault-metadata'
		},
		{
			id: 'vault-prices',
			name: 'Vault prices',
			description:
				'Share price, TVL history in Parquet format, suitable for offline analysis, chart generation, and backtesting-style workflows.',
			instructions:
				'Download the hourly Parquet file to analyse historical vault performance locally or to feed your own notebooks and research jobs.',
			filename: 'vault-historical.parquet',
			format: 'Parquet',
			documentation: documentationUrl,
			downloadUrl: '/trading-view/vaults/datasets/download/vault-prices'
		},
		{
			id: 'vault-metadata-sample',
			name: 'Vault metadata (sample)',
			description: SAMPLE_DESCRIPTION,
			instructions: 'A free metadata sample you can download instantly without an API key.',
			filename: 'vault-metadata.sample.json',
			format: 'JSON',
			documentation: documentationUrl,
			downloadUrl: '/api/vault-metadata.sample.json',
			free: true,
			sampleFile: 'vault-metadata.sample.json'
		},
		{
			id: 'vault-prices-sample',
			name: 'Vault prices (sample)',
			description: SAMPLE_DESCRIPTION,
			instructions: 'A free price-history sample you can download instantly without an API key.',
			filename: 'vault-historical.sample.parquet',
			format: 'Parquet',
			documentation: documentationUrl,
			downloadUrl: '/api/vault-historical.sample.parquet',
			free: true,
			sampleFile: 'vault-historical.sample.parquet'
		}
	];

	const [topVaultsMeta, vaultPricesMeta, metadataSampleMeta, pricesSampleMeta] = await Promise.all([
		headTopVaults(fetch).catch(() => ({ size: null, lastModified: null })),
		headVaultPrices(fetch).catch(() => ({ size: null, lastModified: null })),
		headSample(fetch, 'vault-metadata.sample.json'),
		headSample(fetch, 'vault-historical.sample.parquet')
	]);

	const metadataMap: Record<string, { size: number | null; lastModified: Date | null }> = {
		'vault-metadata': topVaultsMeta,
		'vault-prices': vaultPricesMeta,
		'vault-metadata-sample': metadataSampleMeta,
		'vault-prices-sample': pricesSampleMeta
	};

	const enriched: VaultDataset[] = datasets.map((dataset) => {
		const meta = metadataMap[dataset.id];
		return {
			...dataset,
			size: meta?.size ?? null,
			lastUpdatedAt: meta?.lastModified?.toISOString() ?? null
		};
	});

	setHeaders({
		'cache-control': 'public, max-age=600'
	});

	return { datasets: enriched, origin: url.origin };
}
