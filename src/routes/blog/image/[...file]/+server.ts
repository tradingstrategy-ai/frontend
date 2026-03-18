/**
 * Proxy Ghost images via a local route so social platforms
 * render preview images correctly, and blog roll images can be resized
 * and aggressively cached without hotlinking Ghost directly.
 */
import sharp from 'sharp';
import { error } from '@sveltejs/kit';
import { ghostConfig } from '$lib/config';

const DEFAULT_CACHE_SECONDS = 60 * 60;
const VERSIONED_CACHE_SECONDS = 60 * 60 * 24 * 365;
const MAX_DIMENSION = 2400;
const DEFAULT_WEBP_QUALITY = 42;

function parseDimension(value: string | null) {
	if (!value) return undefined;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
	return Math.min(parsed, MAX_DIMENSION);
}

function parseQuality(value: string | null) {
	if (!value) return DEFAULT_WEBP_QUALITY;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_WEBP_QUALITY;
	return Math.min(parsed, 100);
}

function getCacheControl(version: string | null) {
	if (version) {
		return `public, max-age=${VERSIONED_CACHE_SECONDS}, immutable`;
	}

	return `public, max-age=${DEFAULT_CACHE_SECONDS}, stale-while-revalidate=86400`;
}

export async function GET({ params, url, fetch }) {
	if (!ghostConfig.apiUrl) {
		error(503, 'Ghost API URL not configured');
	}

	const sourceBaseUrl = new URL(`${ghostConfig.apiUrl}/`);
	const sourceUrl = new URL(params.file, sourceBaseUrl);

	if (sourceUrl.origin !== sourceBaseUrl.origin || !sourceUrl.pathname.startsWith(sourceBaseUrl.pathname)) {
		error(400, 'Invalid blog image path');
	}

	const resp = await fetch(sourceUrl);
	if (!resp.ok) {
		return new Response(resp.body, {
			status: resp.status,
			statusText: resp.statusText
		});
	}

	const width = parseDimension(url.searchParams.get('w'));
	const height = parseDimension(url.searchParams.get('h'));
	const quality = parseQuality(url.searchParams.get('q'));
	const format = url.searchParams.get('format');
	const version = url.searchParams.get('v');

	const shouldTransform = Boolean(width || height || format === 'webp' || url.searchParams.has('q'));
	const contentType = resp.headers.get('content-type') ?? 'application/octet-stream';

	const headers = new Headers();
	headers.set('cache-control', getCacheControl(version));

	if (!shouldTransform) {
		headers.set('content-type', contentType);
		const image = await resp.arrayBuffer();
		return new Response(image, { headers });
	}

	const image = Buffer.from(await resp.arrayBuffer());
	let pipeline = sharp(image, { failOn: 'none' });

	if (width || height) {
		pipeline = pipeline.resize({
			width,
			height,
			fit: 'cover',
			withoutEnlargement: true
		});
	}

	if (format === 'webp') {
		pipeline = pipeline.webp({
			quality,
			effort: 4,
			smartSubsample: true
		});
	}

	const transformed = await pipeline.toBuffer();
	headers.set('content-type', format === 'webp' ? 'image/webp' : contentType);

	return new Response(transformed, { headers });
}
