import { error } from '@sveltejs/kit';
import { vaultApiUrl } from '$lib/config';
import { VAULT_PRICES_PARQUET } from '$lib/top-vaults/constants';

const TOP_VAULTS_JSON = 'top_vaults_by_chain.json';
const CRYPTO_CLEANED_PRICES_PARQUET = 'crypto-cleaned-vault-prices-1d.parquet';
const CRYPTO_VAULT_METADATA_JSON = 'crypto-vault-metadata.json';
const EXCHANGE_RATES_PARQUET = 'exchange-rates.parquet';
const VAULT_SCAN_MANIFEST_JSON = 'vault-scan-manifest.json';

/**
 * Restrict downloads to known Worker keys; callers cannot select arbitrary R2 objects.
 * The download handler also uses this mapping for the public attachment name.
 */
function resolveDataset(datasetId: string): { fileKey: string; filename: string; contentType: string } | null {
	switch (datasetId) {
		case 'vault-metadata':
			return { fileKey: TOP_VAULTS_JSON, filename: 'vault-metadata.json', contentType: 'application/json' };
		case 'vault-prices':
			return {
				fileKey: VAULT_PRICES_PARQUET,
				filename: 'vault-historical.parquet',
				contentType: 'application/octet-stream'
			};
		case 'crypto-cleaned-prices':
			return {
				fileKey: CRYPTO_CLEANED_PRICES_PARQUET,
				filename: CRYPTO_CLEANED_PRICES_PARQUET,
				contentType: 'application/vnd.apache.parquet'
			};
		case 'crypto-metadata':
			return {
				fileKey: CRYPTO_VAULT_METADATA_JSON,
				filename: CRYPTO_VAULT_METADATA_JSON,
				contentType: 'application/json'
			};
		case 'exchange-rates':
			return {
				fileKey: EXCHANGE_RATES_PARQUET,
				filename: EXCHANGE_RATES_PARQUET,
				contentType: 'application/vnd.apache.parquet'
			};
		case 'vault-scan-manifest':
			return {
				fileKey: VAULT_SCAN_MANIFEST_JSON,
				filename: VAULT_SCAN_MANIFEST_JSON,
				contentType: 'application/json'
			};
		default:
			return null;
	}
}

/**
 * Stream licensed datasets without using the chart caches or buffering parquet files.
 * Readiness pollers need fresh manifest bytes and the original price ETag to detect
 * an intervening publication; this proxy deliberately does not interpret the JSON.
 */
export async function GET({ params, url, fetch }) {
	const apiKey = url.searchParams.get('api-key');
	if (!apiKey) error(401, 'Missing api-key query parameter');

	const dataset = resolveDataset(params.datasetId);
	if (!dataset) error(404, 'Unknown dataset');

	const upstream = await fetch(`${vaultApiUrl}/files/${dataset.fileKey}`, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Cache-Control': 'no-cache'
		}
	});

	if (upstream.status === 401 || upstream.status === 403) error(403, 'Invalid API key');
	if (!upstream.ok) error(502, `Storage error: ${upstream.status}`);
	if (!upstream.body) error(502, 'Empty response from storage');

	const headers: Record<string, string> = {
		'content-type': dataset.contentType,
		'content-disposition': `attachment; filename="${dataset.filename}"`,
		'cache-control': 'private, no-store'
	};

	// Preserve the storage version, not an ETag computed for the proxy response.
	for (const name of ['content-length', 'etag']) {
		const value = upstream.headers.get(name);
		if (value) headers[name] = value;
	}

	return new Response(upstream.body, { headers });
}
