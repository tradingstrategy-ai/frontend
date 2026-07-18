import { stablecoinMetadataUrl } from '$lib/config';
import { buildMetadataLogoProxyPath, type MetadataLogoOptions } from '$lib/metadata-logo/proxy';
import { slugify } from '$lib/helpers/slugify';
import type { StablecoinMetadata } from './schemas';

export const STABLECOIN_DEPEG_RATE_THRESHOLD = 0.9;
export const OFFCHAIN_USD_STABLECOIN_SLUG = 'usd-offchain';
export const OFFCHAIN_USD_SHORT_DESCRIPTION = 'U.S. Dollars in the banking system without onchain transparency';
const OFFCHAIN_USD_LOGO_URL = '/flags/us.svg';

interface StablecoinLookupInput {
	slug?: string | null;
	symbol?: string | null;
	name?: string | null;
}

interface StablecoinRateInput {
	usd_rate?: number | null;
	peg_rate_currency?: string | null;
	peg_rate?: number | null;
	depegged_at?: string | null;
	denomination_token_rate?: {
		usd_rate?: number | null;
		native_rate?: number | null;
		native_rate_currency?: string | null;
	} | null;
	coingecko_link?: string | null;
	links?: {
		coingecko?: string | null;
	};
}

export function formatStablecoinDisplayName(
	name: string | null | undefined,
	symbol: string | null | undefined
): string | undefined {
	const trimmedName = name?.trim();
	const trimmedSymbol = symbol?.trim();

	if (trimmedName && trimmedSymbol) {
		return trimmedName.toLowerCase().includes(trimmedSymbol.toLowerCase())
			? trimmedName
			: `${trimmedName} ${trimmedSymbol}`;
	}

	return trimmedName || trimmedSymbol || undefined;
}

function normalizeStablecoinText(value: string): string {
	return value
		.replaceAll('+', ' plus ')
		.replaceAll('&', ' and ')
		.replace(/\s+-\s+/g, ' ');
}

function getStablecoinLookupKeys(value: string | null | undefined): string[] {
	if (!value) return [];

	const trimmed = value.trim();
	if (!trimmed) return [];

	const normalized = normalizeStablecoinText(trimmed);
	const keys = new Set<string>([
		trimmed.toLowerCase(),
		normalized.toLowerCase(),
		slugify(trimmed),
		slugify(normalized)
	]);

	return [...keys].filter(Boolean);
}

function getStablecoinFallbackSlug(value: string | null | undefined): string | undefined {
	if (!value) return undefined;

	const trimmed = value.trim();
	if (!trimmed) return undefined;

	const normalized = normalizeStablecoinText(trimmed);

	return slugify(normalized) || slugify(trimmed) || normalized.toLowerCase() || trimmed.toLowerCase();
}

export function buildStablecoinMetadataLookup(metadataIndex: StablecoinMetadata[]): Map<string, StablecoinMetadata> {
	const lookup = new Map<string, StablecoinMetadata>();

	for (const metadata of metadataIndex) {
		for (const candidate of [metadata.slug, metadata.symbol, metadata.name]) {
			for (const key of getStablecoinLookupKeys(candidate)) {
				lookup.set(key, metadata);
			}
		}
	}

	return lookup;
}

export function findStablecoinMetadata(
	metadataIndexOrLookup: StablecoinMetadata[] | Map<string, StablecoinMetadata>,
	...candidates: Array<string | null | undefined>
): StablecoinMetadata | undefined {
	const lookup =
		metadataIndexOrLookup instanceof Map ? metadataIndexOrLookup : buildStablecoinMetadataLookup(metadataIndexOrLookup);

	for (const candidate of candidates) {
		for (const key of getStablecoinLookupKeys(candidate)) {
			const match = lookup.get(key);
			if (match) return match;
		}
	}

	return undefined;
}

export function resolveStablecoinSlug(
	input: StablecoinLookupInput,
	metadataIndexOrLookup?: StablecoinMetadata[] | Map<string, StablecoinMetadata>
): string | undefined {
	const metadata = metadataIndexOrLookup
		? findStablecoinMetadata(metadataIndexOrLookup, input.slug, input.symbol, input.name)
		: undefined;

	if (metadata) return metadata.slug;

	for (const candidate of [input.symbol, input.name, input.slug]) {
		const fallback = getStablecoinFallbackSlug(candidate);
		if (fallback) return fallback;
	}

	return undefined;
}

/**
 * Return the stablecoin details page URL when the denomination is navigable.
 *
 * Off-chain USD has a standalone page, but is intentionally not linked from
 * stablecoin listings because it is a vault accounting denomination rather
 * than an on-chain stablecoin product.
 *
 * @param slug stablecoin denomination slug
 */
export function getStablecoinDetailsHref(slug: string | null | undefined): string | undefined {
	const trimmedSlug = slug?.trim().toLowerCase();
	if (!trimmedSlug || trimmedSlug === OFFCHAIN_USD_STABLECOIN_SLUG) return undefined;

	return `/vaults/stablecoins/${trimmedSlug}`;
}

/**
 * Whether a vault is denominated in Midas' raw USD accounting currency.
 *
 * This is distinct from tokenised stablecoins such as USDT, even though their
 * metadata can expose a USD symbol alias.
 *
 * @param vault vault denomination fields
 */
export function isMidasRawUsdVault(vault: { protocol_slug?: string | null; denomination?: string | null }): boolean {
	return vault.protocol_slug === 'midas' && vault.denomination?.trim().toLowerCase() === 'usd';
}

/**
 * Return the denomination logo for a vault.
 *
 * Midas reports certain vaults as raw USD rather than an on-chain token. These
 * use the US flag; tokenised denominations such as USDT retain their own logos.
 *
 * @param vault vault denomination fields
 * @param slug resolved stablecoin denomination slug
 */
export function getVaultDenominationLogoUrl(
	vault: { protocol_slug?: string | null; denomination?: string | null },
	slug: string | null | undefined
): string | undefined {
	if (isMidasRawUsdVault(vault)) {
		return OFFCHAIN_USD_LOGO_URL;
	}

	return slug ? getStablecoinLogoUrl(slug) : undefined;
}

/**
 * Return the CoinGecko URL for a stablecoin metadata record.
 *
 * @param metadata stablecoin metadata from the external metadata index
 */
export function getStablecoinCoingeckoLink(metadata: StablecoinRateInput | null | undefined): string | undefined {
	return metadata?.coingecko_link ?? metadata?.links?.coingecko ?? undefined;
}

function isNonUsdCurrency(currency: string | null | undefined): boolean {
	return Boolean(currency && currency.toLowerCase() !== 'usd');
}

function finiteRate(rate: number | null | undefined): number | undefined {
	return typeof rate === 'number' && Number.isFinite(rate) ? rate : undefined;
}

/**
 * Return the stablecoin rate in its native peg currency.
 *
 * Stablecoin metadata exposes this as `peg_rate`; vault entries expose the same
 * value as `denomination_token_rate.native_rate`. USD-pegged vault entries only
 * have `denomination_token_rate.usd_rate`, which is also their native rate.
 *
 * @param metadata stablecoin metadata, vault metadata, or a grouped row containing rate fields
 */
export function getStablecoinNativeRate(metadata: StablecoinRateInput | null | undefined): number | undefined {
	const pegRate = finiteRate(metadata?.peg_rate);
	if (pegRate !== undefined) return pegRate;

	const vaultNativeRate = finiteRate(metadata?.denomination_token_rate?.native_rate);
	if (vaultNativeRate !== undefined) return vaultNativeRate;

	const hasNonUsdNativeCurrency =
		isNonUsdCurrency(metadata?.peg_rate_currency) ||
		isNonUsdCurrency(metadata?.denomination_token_rate?.native_rate_currency);
	if (hasNonUsdNativeCurrency) return undefined;

	const vaultUsdRate = finiteRate(metadata?.denomination_token_rate?.usd_rate);
	if (vaultUsdRate !== undefined) return vaultUsdRate;

	return finiteRate(metadata?.usd_rate);
}

/**
 * Stablecoin is considered depegged when its native peg-currency rate is below 90%.
 *
 * @param metadata stablecoin metadata, vault metadata, or a grouped row containing rate fields
 */
export function isStablecoinDepegged(metadata: StablecoinRateInput | null | undefined): boolean {
	const rate = getStablecoinNativeRate(metadata);
	if (rate !== undefined) return rate < STABLECOIN_DEPEG_RATE_THRESHOLD;

	return Boolean(metadata?.depegged_at);
}

/**
 * Return the "light" version of the stablecoin logo URL for a given slug.
 *
 * NOTE: there is no guarantee that a logo actually exists at this URL,
 * so the context in which this is used (e.g., <img> tag) should have
 * appropriate fallback handling (e.g., `removeOnError` action).
 *
 * Returns undefined if the stablecoin metadata URL is not configured.
 */
export function getStablecoinLogoUrl(slug: string, options: MetadataLogoOptions = {}): string | undefined {
	const normalisedSlug = slug.trim().toLowerCase();
	if (normalisedSlug === OFFCHAIN_USD_STABLECOIN_SLUG) {
		return OFFCHAIN_USD_LOGO_URL;
	}
	if (!stablecoinMetadataUrl) return undefined;
	return buildMetadataLogoProxyPath('stablecoin', slug, {
		format: 'webp',
		...options
	});
}
