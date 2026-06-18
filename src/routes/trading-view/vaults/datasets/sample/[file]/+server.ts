import { error } from '@sveltejs/kit';
import { sampleDataUrl } from '$lib/config';
import type { RequestHandler } from './$types';

/**
 * Free, login-less sample dataset downloads.
 *
 * The files live on the public vault-protocol-metadata CDN, but we proxy them
 * server-side so the underlying host is never exposed in the client and users
 * cannot probe the bucket for other objects. Only the whitelisted sample files
 * are reachable; any other name returns 404.
 *
 * NOTE: this lives under /trading-view/... rather than /api/... because the
 * production reverse proxy routes /api/* to the backend (Matilda) server, which
 * would shadow a SvelteKit route placed there.
 *
 * Files are streamed (not buffered) because the samples are tens of MB.
 */
const SAMPLE_FILES: Record<string, string> = {
	'vault-metadata.sample.json': 'application/json',
	'vault-historical.sample.parquet': 'application/vnd.apache.parquet'
};

const baseUrl = new URL(sampleDataUrl).origin;

export const GET: RequestHandler = async ({ params, fetch }) => {
	const { file } = params;
	const contentType = SAMPLE_FILES[file];

	if (!contentType) {
		throw error(404, 'Not found');
	}

	const upstream = await fetch(`${baseUrl}/${file}`);

	if (!upstream.ok || !upstream.body) {
		throw error(502, 'Failed to fetch sample file');
	}

	return new Response(upstream.body, {
		headers: {
			'content-type': contentType,
			'content-disposition': `attachment; filename="${file}"`,
			'cache-control': 'public, max-age=86400'
		}
	});
};
