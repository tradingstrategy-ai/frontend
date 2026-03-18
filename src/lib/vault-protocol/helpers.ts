import { vaultProtocolMetadataUrl } from '$lib/config';
import { buildMetadataLogoProxyPath, type MetadataLogoOptions } from '$lib/metadata-logo/proxy';
import { isUnsupportedProtocolSlug } from '$lib/top-vaults/helpers';

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
export function getVaultProtocolLogoUrl(slug: string, options: MetadataLogoOptions = {}): string | undefined {
	if (!vaultProtocolMetadataUrl) return undefined;
	if (isUnsupportedProtocolSlug(slug)) return undefined;
	return buildMetadataLogoProxyPath('protocol', slug, {
		format: 'webp',
		...options
	});
}
