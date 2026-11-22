/**
 * Runs the background cache-warming tasks (see `$lib/server/warm-tasks`) one after another.
 *
 * Tasks run sequentially because the 2026-11-19 outage was a full libuv thread pool, and
 * `$lib/server/data-limits` allows only four DuckDB queries at once. Sequential start alone
 * does not bound concurrency, because a task that misses its deadline may keep running
 * (an interrupted DuckDB query frees its slot only once it has stopped). So a task that
 * times out is aborted and the run moves on, but the task stays registered as running until
 * its promise settles; later runs skip it (reported as `still running`) instead of
 * starting a second copy. At most one copy of each task can therefore be in flight.
 *
 * One task failing never stops the rest. Each result carries the task's duration, the
 * longest event-loop stall seen while it ran, and the process RSS afterwards, so the cost
 * of warming in the serving process is visible.
 */
import { monitorEventLoopDelay } from 'node:perf_hooks';

export interface WarmTask {
	/** Unique name, used in results and logs. */
	name: string;
	/** Deadline after which the task is aborted and the run moves on. */
	timeoutMs: number;
	/** Do the work; stop early when `signal` aborts. */
	run(fetch: Fetch, signal: AbortSignal): Promise<unknown>;
}

export type WarmTaskStatus = 'ok' | 'failed' | 'timed out' | 'still running';

export interface WarmTaskResult {
	name: string;
	status: WarmTaskStatus;
	durationMs: number;
	/** Longest event-loop delay observed while the task ran. */
	maxEventLoopDelayMs: number | null;
	/** Process resident set size after the task, in MB. */
	rssMb: number;
	error?: string;
}

/** Tasks still in flight from an earlier run (timed out but not yet settled). */
const inFlightTasks = new Map<string, Promise<unknown>>();

function errorSummary(error: unknown) {
	if (error instanceof Error) return `${error.name}: ${error.message}`;
	if (error && typeof error === 'object' && 'status' in error) return `HTTP ${(error as { status: unknown }).status}`;
	return 'Unknown error';
}

const rssMb = () => Math.round(process.memoryUsage().rss / 1024 / 1024);

async function runTask(task: WarmTask, fetch: Fetch): Promise<WarmTaskResult> {
	if (inFlightTasks.has(task.name)) {
		return { name: task.name, status: 'still running', durationMs: 0, maxEventLoopDelayMs: null, rssMb: rssMb() };
	}

	const histogram = monitorEventLoopDelay({ resolution: 10 });
	histogram.enable();
	const controller = new AbortController();
	const startedAt = performance.now();

	const work = Promise.resolve().then(() => task.run(fetch, controller.signal));
	inFlightTasks.set(task.name, work);
	work.then(
		() => inFlightTasks.delete(task.name),
		() => inFlightTasks.delete(task.name)
	);

	let timer: ReturnType<typeof setTimeout> | undefined;
	const deadline = new Promise<'timed out'>((resolve) => {
		timer = setTimeout(() => resolve('timed out'), task.timeoutMs);
	});

	let status: WarmTaskStatus = 'ok';
	let error: string | undefined;
	try {
		const outcome = await Promise.race([work.then(() => 'ok' as const), deadline]);
		if (outcome === 'timed out') {
			status = 'timed out';
			controller.abort(new Error(`${task.name} exceeded ${task.timeoutMs} ms`));
		}
	} catch (e) {
		status = 'failed';
		error = errorSummary(e);
	} finally {
		clearTimeout(timer);
		histogram.disable();
	}

	const maxDelay = histogram.max / 1e6;
	return {
		name: task.name,
		status,
		durationMs: Math.round(performance.now() - startedAt),
		maxEventLoopDelayMs: Number.isFinite(maxDelay) && maxDelay > 0 ? Math.round(maxDelay) : null,
		rssMb: rssMb(),
		...(error ? { error } : {})
	};
}

/**
 * Run tasks one after another. Never throws; every task gets a result.
 *
 * @param tasks tasks in the order they must run (inputs before what is derived from them)
 * @param fetch credential-neutral SvelteKit fetch from the warm endpoint's request
 */
export async function runWarmTasks(tasks: WarmTask[], fetch: Fetch): Promise<WarmTaskResult[]> {
	const results: WarmTaskResult[] = [];
	for (const task of tasks) {
		const result = await runTask(task, fetch);
		results.push(result);
		if (result.status !== 'ok') {
			console.warn(`[cache-warmer] ${task.name}: ${result.status}${result.error ? ` (${result.error})` : ''}`);
		}
	}
	return results;
}

/** Forget in-flight tasks (tests). */
export function resetCacheWarmerForTests() {
	inFlightTasks.clear();
}
