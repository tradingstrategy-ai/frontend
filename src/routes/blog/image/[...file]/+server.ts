/**
 * Proxy Ghost images via a local route so social platforms
 * render preview images correctly.
 */
import { ghostConfig } from '$lib/config';

export async function GET({ params }) {
	const resp = await fetch(`${ghostConfig.apiUrl}/${params.file}`);
	const image = await resp.arrayBuffer();

	const headers = new Headers();
	for (const key of ['content-type', 'cache-control', 'etag']) {
		const value = resp.headers.get(key);
		if (value) headers.set(key, value);
	}

	return new Response(image, { headers });
}
