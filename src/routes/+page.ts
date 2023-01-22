import type { PageLoad } from './$types';
import { backendUrl } from '$lib/config';
import ghostClient from '$lib/blog/client';

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	// Load frontpage API calls in parallel to cut that 1 ms
	// https://stackoverflow.com/q/59663929/315168
	const [momentumResp, impressiveNumbersResp, posts] = await Promise.all([
		fetch(`${backendUrl}/top-momentum?summary=true`),
		fetch(`${backendUrl}/impressive-numbers`),
		ghostClient.posts?.browse({ limit: 4 })
	]);

	let topMomentum, impressiveNumbers;

	if (momentumResp.ok) {
		topMomentum = await momentumResp.json();
	}

	if (impressiveNumbersResp.ok) {
		impressiveNumbers = await impressiveNumbersResp.json();
	}

	// Cache the landing data for 5 minutes at the Cloudflare so pages are
	// served really fast if they get popular, and also for speed test
	setHeaders({
		'cache-control': 'public, max-age=300' // 5 minutes: 5 * 60 = 300
	});

	return { topMomentum, impressiveNumbers, posts };
};
