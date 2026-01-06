import { METADATA_BASE_URL } from './client';

/**
 * Return the "light" version of the vault protocol logo URL for a given
 * vault slug.
 *
 * NOTE: there is no guarantee that a logo actually exists at this URL,
 * so the context in which this is used (e.g., <img> tag) should have
 * appropriate fallback handling (e.g., `removeOnError` action).
 */
export function getVaultProtocolLogoUrl(slug: string) {
	return `${METADATA_BASE_URL}/${slug}/light.png`;
}
