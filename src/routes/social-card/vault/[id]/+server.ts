import { getVaultSparklineUrl } from '$lib/top-vaults/helpers';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { fetchVaultProtocolMetadata } from '$lib/vault-protocol/client';
import { error, redirect } from '@sveltejs/kit';

const FETCH_TIMEOUT_MS = 5000;
const VAULT_ID_PATTERN = /^[a-zA-Z0-9:_-]+$/;

/** Return whether an image fallback is served by this application. */
function isLocalFallbackUrl(fallbackUrl: URL, requestUrl: URL): boolean {
	return (
		fallbackUrl.origin === requestUrl.origin &&
		['/social-card/', '/metadata-logo/', '/flags/'].some((prefix) => fallbackUrl.pathname.startsWith(prefix))
	);
}

/** Compare a metadata URL after applying the same normalisation as request URLs. */
function isSameUrl(candidate: string | null | undefined, expected: URL, requestUrl: URL): boolean {
	if (!candidate) return false;

	try {
		return new URL(candidate, requestUrl).href === expected.href;
	} catch {
		return false;
	}
}

/** Return whether an external fallback belongs to the vault's curator or protocol metadata. */
async function isVaultContextualLogoUrl(
	fallbackUrl: URL,
	vaultId: string,
	requestUrl: URL,
	fetch: typeof globalThis.fetch
): Promise<boolean> {
	try {
		const { curators, vaults } = await getCachedTopVaults(fetch);
		const vault = vaults.find((item) => item.id === vaultId);
		if (!vault) return false;

		const curatorSlug = vault.curator_slug;
		const logos = curatorSlug ? curators[curatorSlug]?.logos : undefined;
		if (
			logos &&
			[logos.generic, logos.light, logos.dark].some((logoUrl) => isSameUrl(logoUrl, fallbackUrl, requestUrl))
		) {
			return true;
		}

		const protocolMetadata = await fetchVaultProtocolMetadata(fetch, vault.protocol_slug, vault.protocol);
		return isSameUrl(protocolMetadata?.logos.dark, fallbackUrl, requestUrl);
	} catch {
		return false;
	}
}

/** Serve a vault sparkline or redirect social scrapers to its contextual fallback image. */
export async function GET({ params, url, fetch }) {
	if (!VAULT_ID_PATTERN.test(params.id)) error(400, 'Invalid vault ID');

	const fallback = url.searchParams.get('fallback');
	if (!fallback) error(400, 'Missing social-card fallback image');

	let fallbackUrl: URL;
	try {
		fallbackUrl = new URL(fallback, url);
	} catch {
		error(400, 'Invalid social-card fallback image');
	}
	if (!['http:', 'https:'].includes(fallbackUrl.protocol)) error(400, 'Invalid social-card fallback image');
	if (!(isLocalFallbackUrl(fallbackUrl, url) || (await isVaultContextualLogoUrl(fallbackUrl, params.id, url, fetch)))) {
		error(400, 'Invalid social-card fallback image');
	}

	const sparklineUrl = getVaultSparklineUrl({ id: params.id }, 'png');
	if (!sparklineUrl) {
		redirect(302, fallbackUrl.href);
	}

	try {
		const response = await fetch(sparklineUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
		const contentType = response.headers.get('content-type') ?? '';

		if (response.ok && contentType.startsWith('image/png')) {
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
