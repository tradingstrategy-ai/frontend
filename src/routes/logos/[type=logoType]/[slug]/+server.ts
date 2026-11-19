import { error, text } from '@sveltejs/kit';

/** 24 hours in browsers and at the Cloudflare edge */
const LOGO_CACHE_CONTROL = 'public, max-age=86400, stale-while-revalidate=86400';

/**
 * Serve a bundled SVG logo from `$lib/assets/logos/<type>/<slug>.svg`.
 *
 * Links use `/logos/<type>/<slug>.svg` (see `getLogoUrl`): Cloudflare's default cache rules
 * only cache URLs with a static file extension, so the extensionless form went to the origin
 * on every request (19 logos on a vault listing page). The extensionless form still works for
 * old links.
 *
 * The URL is keyed by slug, not content, so the lifetime is 24 hours rather than
 * "immutable": a replaced logo shows up within a day without a URL change.
 */
export async function GET({ params }) {
	const { type } = params;
	const slug = params.slug.replace(/\.svg$/, '');

	let data: string;

	try {
		data = (await import(`$lib/assets/logos/${type}/${slug}.svg?raw`)).default;
	} catch {
		error(404, 'File not found');
	}

	return text(data, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': LOGO_CACHE_CONTROL
		}
	});
}
