import { error } from '@sveltejs/kit';
import { createImagePipeline, runImageJob } from '$lib/server/image-pipeline';
import {
	DEFAULT_TRANSFORM_DIMENSION,
	getMetadataLogoCacheControl,
	getMetadataLogoSourceUrl,
	isMetadataLogoKind,
	parseMetadataLogoDimension,
	parseMetadataLogoFormat,
	parseMetadataLogoQuality
} from '$lib/metadata-logo/proxy';

const FETCH_TIMEOUT_MS = 5000;

export async function GET({ params, url, fetch }) {
	if (!isMetadataLogoKind(params.kind)) {
		error(404, 'Invalid metadata logo type');
	}

	const sourceUrl = getMetadataLogoSourceUrl(params.kind, params.slug);
	if (!sourceUrl) {
		error(503, 'Metadata logo service not configured');
	}

	const requestedFormatValue = url.searchParams.get('format');
	const requestedFormat = parseMetadataLogoFormat(requestedFormatValue);

	if (requestedFormatValue && !requestedFormat) {
		error(400, 'Invalid metadata logo format');
	}

	const format = requestedFormat ?? 'webp';
	const width = parseMetadataLogoDimension(url.searchParams.get('w'));
	const height = parseMetadataLogoDimension(url.searchParams.get('h'));
	const quality = parseMetadataLogoQuality(url.searchParams.get('q'), format);
	const version = url.searchParams.get('v');

	const resp = await fetch(sourceUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
	if (!resp.ok) {
		return new Response(resp.body, {
			status: resp.status,
			statusText: resp.statusText
		});
	}

	const originalContentType = resp.headers.get('content-type') ?? 'application/octet-stream';
	const headers = new Headers({
		'cache-control': getMetadataLogoCacheControl(version)
	});

	const shouldTransform = format !== 'original' || Boolean(width || height);

	if (!shouldTransform) {
		headers.set('content-type', originalContentType);
		return new Response(await resp.arrayBuffer(), { headers });
	}

	const image = Buffer.from(await resp.arrayBuffer());

	// Re-encoding always happens inside a bounding box: a logo requested without a size
	// would otherwise be encoded at the source's native resolution.
	const boundingBox =
		width || height ? { width, height } : { width: DEFAULT_TRANSFORM_DIMENSION, height: DEFAULT_TRANSFORM_DIMENSION };
	let pipeline = createImagePipeline(image).resize({
		...boundingBox,
		fit: 'inside',
		withoutEnlargement: true
	});

	switch (format) {
		case 'avif':
			pipeline = pipeline.avif({ quality, effort: 4 });
			headers.set('content-type', 'image/avif');
			break;
		case 'original':
			headers.set('content-type', originalContentType);
			break;
		case 'webp':
			pipeline = pipeline.webp({
				quality,
				alphaQuality: Math.min(quality + 10, 100),
				effort: 4,
				smartSubsample: true
			});
			headers.set('content-type', 'image/webp');
			break;
	}

	const transformed = await runImageJob(() => pipeline.toBuffer());
	return new Response(new Uint8Array(transformed), { headers });
}
