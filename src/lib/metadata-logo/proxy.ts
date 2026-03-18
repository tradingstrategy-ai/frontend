import { stablecoinMetadataUrl, vaultProtocolMetadataUrl } from '$lib/config';

export const metadataLogoKinds = ['stablecoin', 'protocol'] as const;
export type MetadataLogoKind = (typeof metadataLogoKinds)[number];

export const metadataLogoFormats = ['original', 'webp', 'avif'] as const;
export type MetadataLogoFormat = (typeof metadataLogoFormats)[number];

export interface MetadataLogoOptions {
	format?: MetadataLogoFormat;
	width?: number;
	height?: number;
	quality?: number;
	version?: string;
}

const DEFAULT_WEBP_QUALITY = 72;
const DEFAULT_AVIF_QUALITY = 58;
const MAX_DIMENSION = 1024;
const DEFAULT_CACHE_SECONDS = 60 * 60 * 24;
const VERSIONED_CACHE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Build the local proxy URL for a stablecoin or protocol logo.
 *
 * @param kind Logo source type served by the proxy route
 * @param slug Metadata slug used by the upstream logo bucket
 * @param options Optional transform and cache-busting parameters
 * @returns Relative proxy URL, or undefined for an empty slug
 */
export function buildMetadataLogoProxyPath(
	kind: MetadataLogoKind,
	slug: string,
	options: MetadataLogoOptions = {}
): string | undefined {
	const trimmedSlug = slug.trim();
	if (!trimmedSlug) return undefined;

	const query = new URLSearchParams();

	if (options.format) query.set('format', options.format);
	if (Number.isFinite(options.width) && options.width! > 0) query.set('w', String(options.width));
	if (Number.isFinite(options.height) && options.height! > 0) query.set('h', String(options.height));
	if (Number.isFinite(options.quality) && options.quality! > 0) query.set('q', String(options.quality));
	if (options.version) query.set('v', options.version);

	const path = `/metadata-logo/${kind}/${encodeURIComponent(trimmedSlug)}`;
	const queryString = query.toString();

	return queryString ? `${path}?${queryString}` : path;
}

/**
 * Resolve the upstream logo URL for the configured metadata bucket.
 *
 * @param kind Logo source type served by the proxy route
 * @param slug Metadata slug used by the upstream logo bucket
 * @returns Absolute upstream URL, or undefined if the service is not configured
 */
export function getMetadataLogoSourceUrl(kind: MetadataLogoKind, slug: string): URL | undefined {
	const baseUrl = getMetadataLogoBaseUrl(kind);
	const trimmedSlug = slug.trim();

	if (!baseUrl || !trimmedSlug) return undefined;

	return new URL(`${encodeURIComponent(trimmedSlug)}/light.png`, new URL(`${baseUrl}/`));
}

export function getMetadataLogoBaseUrl(kind: MetadataLogoKind): string | undefined {
	return kind === 'stablecoin' ? stablecoinMetadataUrl : vaultProtocolMetadataUrl;
}

export function isMetadataLogoKind(value: string): value is MetadataLogoKind {
	return metadataLogoKinds.includes(value as MetadataLogoKind);
}

export function parseMetadataLogoFormat(value: string | null): MetadataLogoFormat | undefined {
	if (!value) return undefined;
	return metadataLogoFormats.includes(value as MetadataLogoFormat) ? (value as MetadataLogoFormat) : undefined;
}

export function parseMetadataLogoDimension(value: string | null): number | undefined {
	if (!value) return undefined;

	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return undefined;

	return Math.min(parsed, MAX_DIMENSION);
}

export function parseMetadataLogoQuality(value: string | null, format: MetadataLogoFormat): number {
	const fallback = getDefaultMetadataLogoQuality(format);
	if (!value) return fallback;

	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

	return Math.min(parsed, 100);
}

export function getDefaultMetadataLogoQuality(format: MetadataLogoFormat): number {
	switch (format) {
		case 'avif':
			return DEFAULT_AVIF_QUALITY;
		case 'webp':
			return DEFAULT_WEBP_QUALITY;
		case 'original':
			return DEFAULT_WEBP_QUALITY;
	}
}

export function getMetadataLogoCacheControl(version: string | null): string {
	if (version) {
		return `public, max-age=${VERSIONED_CACHE_SECONDS}, immutable`;
	}

	return `public, max-age=${DEFAULT_CACHE_SECONDS}, stale-while-revalidate=604800`;
}
