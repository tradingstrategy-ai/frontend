import { error } from '@sveltejs/kit';
import { headTopVaults, headVaultPrices } from '$lib/top-vaults/server-config';
import { isR2Configured } from '$lib/r2/client';
import { VAULT_PRICES_PARQUET } from '$lib/top-vaults/constants';

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
	/** Public-facing download URL (points to our proxy, not the CDN) */
	downloadUrl: string;
};

type VaultDataset = VaultDatasetDefinition & {
	size: number | null;
	lastUpdatedAt: string | null;
};

/**
 * Build the vault datasets page payload.
 *
 * Defines the frontend-owned dataset catalogue and enriches each entry with
 * server-side freshness metadata from R2.
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
			filename: 'top_vaults_by_chain.json',
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
			filename: VAULT_PRICES_PARQUET,
			format: 'Parquet',
			documentation: documentationUrl,
			downloadUrl: '/trading-view/vaults/datasets/download/vault-prices'
		}
	];

	const [topVaultsMeta, vaultPricesMeta] = await Promise.all([
		headTopVaults(fetch).catch(() => ({ size: null, lastModified: null })),
		headVaultPrices(fetch).catch(() => ({ size: null, lastModified: null }))
	]);

	const metadataMap: Record<string, { size: number | null; lastModified: Date | null }> = {
		'vault-metadata': topVaultsMeta,
		'vault-prices': vaultPricesMeta
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
