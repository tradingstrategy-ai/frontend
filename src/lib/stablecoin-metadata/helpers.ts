import { stablecoinMetadataUrl } from '$lib/config';

/**
 * Return the "light" version of the stablecoin logo URL for a given slug.
 *
 * NOTE: there is no guarantee that a logo actually exists at this URL,
 * so the context in which this is used (e.g., <img> tag) should have
 * appropriate fallback handling (e.g., `removeOnError` action).
 *
 * Returns undefined if the stablecoin metadata URL is not configured.
 */
export function getStablecoinLogoUrl(slug: string): string | undefined {
	if (!stablecoinMetadataUrl) return undefined;
	return `${stablecoinMetadataUrl}/${slug}/light.png`;
}
