import { ghostConfig } from '$lib/config';

type BlogImageFormat = 'original' | 'webp';

type BlogImageOptions = {
	width?: number;
	height?: number;
	quality?: number;
	format?: BlogImageFormat;
	version?: string | number | Date | null;
};

/**
 * Ghost(Pro) serves uploaded images from its shared storage CDN rather than the
 * site's own API host, e.g. `https://storage.ghost.io/c/<site-id>/content/images/x.png`.
 * The `/content/` path suffix is the same one the API host serves (and redirects to
 * storage), so the local proxy can fetch it through the API host.
 */
const GHOST_STORAGE_HOST = 'storage.ghost.io';
const GHOST_CONTENT_PATH = '/content/images/';

/**
 * Resolve the `/content/...` path of a Ghost image relative to the configured Ghost API,
 * or `undefined` when the URL is not a Ghost image we can proxy.
 */
function getGhostContentPath(imageUrl: string, apiUrl: string): string | undefined {
	if (imageUrl.startsWith(apiUrl)) {
		return stripLeadingSlashes(imageUrl.slice(apiUrl.length));
	}

	let parsed: URL;
	try {
		parsed = new URL(imageUrl);
	} catch {
		return undefined;
	}

	if (parsed.hostname !== GHOST_STORAGE_HOST) return undefined;

	const contentIndex = parsed.pathname.indexOf(GHOST_CONTENT_PATH);
	if (contentIndex === -1) return undefined;

	return stripLeadingSlashes(parsed.pathname.slice(contentIndex));
}

function stripLeadingSlashes(path: string): string {
	return path.replace(/^\/+/, '');
}

/**
 * Build a URL for a Ghost blog image served through the local `/blog/image/` proxy, which
 * resizes, crops and re-encodes the image (see `src/routes/blog/image/[...file]/+server.ts`).
 *
 * Returns the original URL unchanged when the image is not hosted by Ghost.
 *
 * @param imageUrl Ghost `feature_image` URL (API host or `storage.ghost.io`)
 * @param options Resize / format / cache-busting options passed to the proxy
 */
export function getBlogImageUrl(imageUrl: string, options: BlogImageOptions = {}) {
	const { apiUrl } = ghostConfig;
	if (!apiUrl) return imageUrl;

	const path = getGhostContentPath(imageUrl, apiUrl);
	if (path === undefined) return imageUrl;

	const params = new URLSearchParams();

	if (options.width) params.set('w', `${options.width}`);
	if (options.height) params.set('h', `${options.height}`);
	if (options.quality) params.set('q', `${options.quality}`);
	if (options.format && options.format !== 'original') params.set('format', options.format);

	const version =
		options.version instanceof Date
			? options.version.toISOString()
			: options.version != null
				? `${options.version}`
				: null;
	if (version) params.set('v', version);

	const query = params.toString();
	return `/blog/image/${path}${query ? `?${query}` : ''}`;
}

/**
 * Build `src` and `srcset` for a Ghost image rendered at a fixed crop, with 1x and 2x
 * candidates served by the image proxy.
 *
 * @param imageUrl Ghost `feature_image` URL
 * @param options crop box and encoding at 1x; `width`/`height` are doubled for the 2x candidate
 */
export function getBlogImageSrcSet(
	imageUrl: string,
	options: Required<Pick<BlogImageOptions, 'width' | 'height'>> & Pick<BlogImageOptions, 'quality' | 'version'>
) {
	const variant = (scale: number) =>
		getBlogImageUrl(imageUrl, {
			...options,
			width: options.width * scale,
			height: options.height * scale,
			format: 'webp'
		});
	const src = variant(1);
	return { src, srcset: `${src} ${options.width}w, ${variant(2)} ${options.width * 2}w` };
}
