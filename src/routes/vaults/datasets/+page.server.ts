import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { headTopVaults, headVaultDataset, headVaultPrices } from '$lib/top-vaults/server-config';
import { isR2Configured } from '$lib/r2/client';
import { sampleDataUrl } from '$lib/config';

const documentationUrl = 'https://tradingstrategy.ai/docs/overview/defi-vault-data.html';

const CRYPTO_CLEANED_PRICES_PARQUET = 'crypto-cleaned-vault-prices-1d.parquet';
const CRYPTO_VAULT_METADATA_JSON = 'crypto-vault-metadata.json';
const EXCHANGE_RATES_PARQUET = 'exchange-rates.parquet';
const CRYPTO_DATASET_DESCRIPTION =
	'Vaults with BTC and ETH denominations. Performance metrics of these vaults have been calculated against the underlying token and they are not directly comparable to stablecoin vaults.';

/** Origin of the public CDN that hosts the free sample files (host kept server-side). */
const sampleBaseUrl = new URL(sampleDataUrl).origin;

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
	/** Free sample — downloadable without an API key (proxied via /vaults/datasets/sample) */
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
			downloadUrl: '/vaults/datasets/download/vault-metadata'
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
			downloadUrl: '/vaults/datasets/download/vault-prices'
		},
		{
			id: 'crypto-cleaned-prices',
			name: 'Crypto cleaned prices',
			description: CRYPTO_DATASET_DESCRIPTION,
			instructions:
				'Download the daily Parquet file to analyse cleaned crypto vault prices in notebooks, data warehouses, or your own research pipelines.',
			filename: CRYPTO_CLEANED_PRICES_PARQUET,
			format: 'Parquet',
			documentation: documentationUrl,
			downloadUrl: '/vaults/datasets/download/crypto-cleaned-prices'
		},
		{
			id: 'crypto-metadata',
			name: 'Crypto metadata',
			description: CRYPTO_DATASET_DESCRIPTION,
			instructions:
				'Download the summary JSON when you need the latest crypto vault catalogue and metadata for offline research or your own pipelines.',
			filename: CRYPTO_VAULT_METADATA_JSON,
			format: 'JSON',
			documentation: documentationUrl,
			downloadUrl: '/vaults/datasets/download/crypto-metadata'
		},
		{
			id: 'exchange-rates',
			name: 'Exchange rates',
			description:
				'Historical exchange rates in Parquet format for converting and comparing dataset values across currencies.',
			instructions:
				'Download the Parquet file to join exchange rates with vault data in your own analysis and reporting workflows.',
			filename: EXCHANGE_RATES_PARQUET,
			format: 'Parquet',
			documentation: documentationUrl,
			downloadUrl: '/vaults/datasets/download/exchange-rates'
		},
		{
			id: 'vault-metadata-sample',
			name: 'Vault metadata (sample)',
			description: SAMPLE_DESCRIPTION,
			instructions: 'A free metadata sample you can download instantly without an API key.',
			filename: 'vault-metadata.sample.json',
			format: 'JSON',
			documentation: documentationUrl,
			downloadUrl: '/vaults/datasets/sample/vault-metadata.sample.json',
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
			downloadUrl: '/vaults/datasets/sample/vault-historical.sample.parquet',
			free: true,
			sampleFile: 'vault-historical.sample.parquet'
		}
	];

	const [
		topVaultsMeta,
		vaultPricesMeta,
		cryptoCleanedPricesMeta,
		cryptoMetadataMeta,
		exchangeRatesMeta,
		metadataSampleMeta,
		pricesSampleMeta
	] = await Promise.all([
		headTopVaults(fetch).catch(() => ({ size: null, lastModified: null })),
		headVaultPrices(fetch).catch(() => ({ size: null, lastModified: null })),
		headVaultDataset(CRYPTO_CLEANED_PRICES_PARQUET).catch(() => ({ size: null, lastModified: null })),
		headVaultDataset(CRYPTO_VAULT_METADATA_JSON).catch(() => ({ size: null, lastModified: null })),
		headVaultDataset(EXCHANGE_RATES_PARQUET).catch(() => ({ size: null, lastModified: null })),
		headSample(fetch, 'vault-metadata.sample.json'),
		headSample(fetch, 'vault-historical.sample.parquet')
	]);

	const metadataMap: Record<string, { size: number | null; lastModified: Date | null }> = {
		'vault-metadata': topVaultsMeta,
		'vault-prices': vaultPricesMeta,
		'crypto-cleaned-prices': cryptoCleanedPricesMeta,
		'crypto-metadata': cryptoMetadataMeta,
		'exchange-rates': exchangeRatesMeta,
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

	// Show free samples above the paid datasets (stable sort keeps each group's order)
	enriched.sort((a, b) => Number(b.free ?? false) - Number(a.free ?? false));

	// Creem appends checkout_id (plus product_id, signature, …) when redirecting after a
	// successful Pro purchase. The flag only drives a hint, so presence is sufficient.
	const purchaseComplete = url.searchParams.has('checkout_id');

	setHeaders({
		// Never let a shared cache serve the post-purchase variant to other visitors
		'cache-control': purchaseComplete ? 'no-store' : dev ? 'no-cache' : 'public, max-age=600'
	});

	return { datasets: enriched, origin: url.origin, purchaseComplete };
}
