import { vaultProtocolMetadataUrl } from '$lib/config';

/**
 * Return the "light" version of the vault protocol logo URL for a given
 * vault slug.
 *
 * NOTE: there is no guarantee that a logo actually exists at this URL,
 * so the context in which this is used (e.g., <img> tag) should have
 * appropriate fallback handling (e.g., `removeOnError` action).
 *
 * Returns undefined if the vault protocol metadata URL is not configured.
 */
export function getVaultProtocolLogoUrl(slug: string): string | undefined {
	if (!vaultProtocolMetadataUrl) return undefined;
	return `${vaultProtocolMetadataUrl}/${slug}/light.png`;
}
