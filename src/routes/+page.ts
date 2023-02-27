import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import ghostClient from '$lib/blog/client';

// await API response and return JSON; fail gracefully if there's an error
async function getRespJson(req: Promise<Response>) {
	const resp = await req;
	if (resp.ok) {
		return resp.json();
	}
	console.error(`Backend API ${resp.url} failed; rendering home page without data`);
}

// fetch blog posts; fail gracefully if there's an error
async function fetchBlogPosts(options = {}) {
	try {
		return await ghostClient.posts?.browse(options);
	} catch (e) {
		console.error('Ghost API request failed; rendering home page without blog roll');
	}
}

export const load = (async ({ fetch, setHeaders }) => {
	// Cache the landing data for 5 minutes at the Cloudflare so pages are
	// served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=300' // 5 minutes: 5 * 60 = 300
	});

	// SvelteKit handles these in parallel and automatically unwraps top-level promises
	return {
		topMomentum: getRespJson(fetch(`${backendUrl}/top-momentum?summary=true`)),
		impressiveNumbers: getRespJson(fetch(`${backendUrl}/impressive-numbers`)),
		posts: fetchBlogPosts({ limit: 4 })
	};
}) satisfies PageLoad;
