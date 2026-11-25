/**
 * Protected local trigger for the background cache warmer, called by the scheduler in
 * `scripts/server.js`. `?job=all` refreshes every server-side data cache; `?job=frequent`
 * only the `/strategies` snapshot and the home page blog roll. See `$lib/server/warm-tasks`.
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { runWarmTasks } from '$lib/server/cache-warmer';
import { hasInternalToken } from '$lib/server/internal-token';
import { getWarmCacheStatus } from '$lib/server/warm-cache';
import { getWarmTasks, type WarmJob } from '$lib/server/warm-tasks';

const headers = { 'cache-control': 'private, no-store' };

let running: WarmJob | null = null;

export const POST: RequestHandler = async ({ request, fetch, url }) => {
	if (!hasInternalToken(request)) {
		return json({ error: 'Unauthorised' }, { status: 401, headers });
	}

	const job = url.searchParams.get('job') ?? 'all';
	if (job !== 'all' && job !== 'frequent') {
		return json({ error: `Unknown job "${job}"` }, { status: 400, headers });
	}
	if (running) {
		return json({ error: `The ${running} job is still running` }, { status: 409, headers });
	}

	running = job;
	const startedAt = performance.now();
	try {
		const tasks = await runWarmTasks(getWarmTasks(job), fetch);
		const failed = tasks.filter((task) => task.status !== 'ok').length;
		return json(
			{
				job,
				durationMs: Math.round(performance.now() - startedAt),
				failed,
				tasks,
				caches: getWarmCacheStatus().filter((entry) => entry.state !== 'fresh')
			},
			{ headers }
		);
	} finally {
		running = null;
	}
};
