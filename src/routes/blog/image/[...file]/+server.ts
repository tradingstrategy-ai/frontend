/**
 * Proxy Ghost images via a local route so social platforms
 * render preview images correctly.
 */
import { ghostConfig } from '$lib/config';

export async function GET({ params }) {
	const resp = await fetch(`${ghostConfig.apiUrl}/${params.file}`);
	const image = await resp.arrayBuffer();

	const headers = {
		'content-type': resp.headers.get('content-type'),
		'cache-control': resp.headers.get('cache-control'),
		etag: resp.headers.get('etag')
	};

	return new Response(image, { headers });
}
