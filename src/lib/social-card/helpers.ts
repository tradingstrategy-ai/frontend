import type { CuratorInfo } from '$lib/top-vaults/schemas';

export const TRADING_STRATEGY_SOCIAL_IMAGE_PATH = '/social-card/trading-strategy';

interface SocialCardImageContext {
	curatorLogoUrl?: string | null;
	protocolLogoUrl?: string | null;
	blockchainLogoUrl?: string | null;
	stablecoinLogoUrl?: string | null;
}

/**
 * Return the best available social-card image using the site-wide priority.
 *
 * @param context Contextual logo URLs ordered from the most to least specific
 */
export function selectSocialCardImage(context: SocialCardImageContext): string {
	return (
		[context.curatorLogoUrl, context.protocolLogoUrl, context.blockchainLogoUrl, context.stablecoinLogoUrl].find(
			(url): url is string => Boolean(url?.trim())
		) ?? TRADING_STRATEGY_SOCIAL_IMAGE_PATH
	);
}

/**
 * Return the curator logo that is usable in the broadest range of contexts.
 *
 * @param curator Curator metadata, when the page has curator context
 */
export function getCuratorSocialLogoUrl(curator?: CuratorInfo | null): string | undefined {
	return curator?.logos.generic ?? curator?.logos.light ?? curator?.logos.dark ?? undefined;
}

/**
 * Return the raster social-card endpoint for a blockchain logo.
 *
 * @param slug Blockchain slug used by the local logo registry
 */
export function getBlockchainSocialLogoUrl(slug?: string | null): string | undefined {
	return slug ? `/social-card/blockchain/${encodeURIComponent(slug)}` : undefined;
}
