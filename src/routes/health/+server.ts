/**
 * Liveness probe that exercises the libuv threadpool.
 *
 * A plain "is the port open" check stays green while the pool is starved by native jobs,
 * because the event loop itself is idle; meanwhile every SSR `fetch` (needs `dns.lookup`)
 * and static file read (needs `fs`) is queued behind them. Both probes below are pool
 * operations, raced against an event-loop timer, so a starved pool yields 503 within
 * {@link CHECK_DEADLINE_MS} and the container healthcheck can restart the process.
 *
 * Response bodies carry only booleans and millisecond timings.
 */
import { lookup } from 'node:dns/promises';
import { stat } from 'node:fs/promises';
import { json } from '@sveltejs/kit';
import { backendInternalUrl, backendUrl } from '$lib/config';

const CHECK_DEADLINE_MS = 5_000;

interface CheckResult {
	ok: boolean;
	ms: number;
}

async function runCheck(check: () => Promise<unknown>): Promise<CheckResult> {
	const startedAt = performance.now();
	let timer: ReturnType<typeof setTimeout> | undefined;
	const deadline = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new Error('health check deadline')), CHECK_DEADLINE_MS);
	});

	try {
		await Promise.race([check(), deadline]);
		return { ok: true, ms: Math.round(performance.now() - startedAt) };
	} catch {
		return { ok: false, ms: Math.round(performance.now() - startedAt) };
	} finally {
		clearTimeout(timer);
	}
}

export async function GET() {
	const backendHost = new URL(backendInternalUrl || backendUrl).hostname;

	const [dns, fs] = await Promise.all([runCheck(() => lookup(backendHost)), runCheck(() => stat(process.cwd()))]);
	const ok = dns.ok && fs.ok;

	return json(
		{ status: ok ? 'ok' : 'degraded', checks: { dns, fs } },
		{ status: ok ? 200 : 503, headers: { 'cache-control': 'no-store' } }
	);
}
