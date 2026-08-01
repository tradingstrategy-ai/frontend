import { getVaultSparklineUrl } from '$lib/top-vaults/helpers';
import { error, redirect } from '@sveltejs/kit';

const FETCH_TIMEOUT_MS = 5000;

/** Serve a vault sparkline or redirect social scrapers to its contextual fallback image. */
export async function GET({ params, url, fetch }) {
	const fallback = url.searchParams.get('fallback');
	if (!fallback) error(400, 'Missing social-card fallback image');

	let fallbackUrl: URL;
	try {
		fallbackUrl = new URL(fallback, url);
	} catch {
		error(400, 'Invalid social-card fallback image');
	}
	if (!['http:', 'https:'].includes(fallbackUrl.protocol)) error(400, 'Invalid social-card fallback image');

	const sparklineUrl = getVaultSparklineUrl({ id: params.id }, 'png');
	if (!sparklineUrl) redirect(302, fallbackUrl.href);

	try {
		const response = await fetch(sparklineUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
		const contentType = response.headers.get('content-type') ?? '';

		if (response.ok && contentType.startsWith('image/')) {
			return new Response(response.body, {
				headers: {
					'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
					'content-type': contentType,
					'x-content-type-options': 'nosniff'
				}
			});
		}
	} catch {
		// Fall through to the contextual image when the sparkline CDN is unavailable.
	}

	redirect(302, fallbackUrl.href);
}
