import { error } from '@sveltejs/kit';
import { vaultApiUrl } from '$lib/config';
import { VAULT_PRICES_PARQUET } from '$lib/top-vaults/constants';

const TOP_VAULTS_JSON = 'top_vaults_by_chain.json';

/** Map public dataset IDs to their Worker file key and download metadata. */
function resolveDataset(datasetId: string): { fileKey: string; filename: string; contentType: string } | null {
	switch (datasetId) {
		case 'vault-metadata':
			return { fileKey: TOP_VAULTS_JSON, filename: TOP_VAULTS_JSON, contentType: 'application/json' };
		case 'vault-prices':
			return { fileKey: VAULT_PRICES_PARQUET, filename: VAULT_PRICES_PARQUET, contentType: 'application/octet-stream' };
		default:
			return null;
	}
}

export async function GET({ params, url, fetch }) {
	const apiKey = url.searchParams.get('api-key');
	if (!apiKey) error(401, 'Missing api-key query parameter');

	const dataset = resolveDataset(params.datasetId);
	if (!dataset) error(404, 'Unknown dataset');

	const upstream = await fetch(`${vaultApiUrl}/files/${dataset.fileKey}`, {
		headers: { Authorization: `Bearer ${apiKey}` }
	});

	if (upstream.status === 401 || upstream.status === 403) error(403, 'Invalid API key');
	if (!upstream.ok) error(502, `Storage error: ${upstream.status}`);
	if (!upstream.body) error(502, 'Empty response from storage');

	const headers: Record<string, string> = {
		'content-type': dataset.contentType,
		'content-disposition': `attachment; filename="${dataset.filename}"`,
		'cache-control': 'private, no-store'
	};

	const contentLength = upstream.headers.get('content-length');
	if (contentLength) headers['content-length'] = contentLength;

	return new Response(upstream.body, { headers });
}
