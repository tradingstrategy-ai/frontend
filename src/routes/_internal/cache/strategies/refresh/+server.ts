/** Protected local trigger for the adapter-node strategies cache scheduler. */
import { timingSafeEqual } from 'node:crypto';
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getStrategiesPageCacheStatus, refreshStrategiesPageData } from '$lib/strategies/page-cache.server';

function tokenMatches(request: Request) {
	const token = env.TS_PRIVATE_STRATEGIES_REFRESH_TOKEN;
	const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
	if (!token || !supplied) return false;
	const encoder = new TextEncoder();
	const expectedBuffer = encoder.encode(token);
	const suppliedBuffer = encoder.encode(supplied);
	return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const headers = { 'cache-control': 'private, no-store' };
	if (!tokenMatches(request)) {
		return json({ error: 'Unauthorised' }, { status: 401, headers });
	}

	const startedAt = performance.now();
	try {
		await refreshStrategiesPageData(fetch);
		return json(
			{ durationMs: Math.round(performance.now() - startedAt), cache: getStrategiesPageCacheStatus() },
			{ headers }
		);
	} catch {
		return json({ error: 'Refresh failed', cache: getStrategiesPageCacheStatus() }, { status: 503, headers });
	}
};
