import { error, text } from '@sveltejs/kit';

/**
 * Serve a bundled SVG logo from `$lib/assets/logos/<type>/<slug>.svg`.
 *
 * The URL is keyed by slug, not content, and several call sites hard-code `/logos/…`
 * paths, so the cache lifetime is a week rather than "immutable": long enough to keep
 * the logos out of every page's request waterfall, short enough that a replaced logo
 * shows up without a URL change.
 */
export async function GET({ params }) {
	const { type, slug } = params;

	let data: string;

	try {
		data = (await import(`$lib/assets/logos/${type}/${slug}.svg?raw`)).default;
	} catch (e) {
		error(404, 'File not found');
	}

	return text(data, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
		}
	});
}
