import { stablecoinMetadataUrl } from '$lib/config';
import { buildMetadataLogoProxyPath, type MetadataLogoOptions } from '$lib/metadata-logo/proxy';
import { slugify } from '$lib/helpers/slugify';
import type { StablecoinMetadata } from './schemas';

interface StablecoinLookupInput {
	slug?: string | null;
	symbol?: string | null;
	name?: string | null;
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
	return value.replaceAll('+', ' plus ').replaceAll('&', ' and ');
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
 * Return the "light" version of the stablecoin logo URL for a given slug.
 *
 * NOTE: there is no guarantee that a logo actually exists at this URL,
 * so the context in which this is used (e.g., <img> tag) should have
 * appropriate fallback handling (e.g., `removeOnError` action).
 *
 * Returns undefined if the stablecoin metadata URL is not configured.
 */
export function getStablecoinLogoUrl(slug: string, options: MetadataLogoOptions = {}): string | undefined {
	if (!stablecoinMetadataUrl) return undefined;
	return buildMetadataLogoProxyPath('stablecoin', slug, {
		format: 'webp',
		...options
	});
}
