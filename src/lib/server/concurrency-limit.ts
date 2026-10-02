/**
 * Minimal promise semaphore for bounding concurrent native work.
 *
 * Node runs CPU-bound native jobs (sharp, DuckDB, zlib) on the shared libuv threadpool that
 * also serves `dns.lookup` and every `fs` call. Letting any one of those libraries occupy
 * every pool thread stalls DNS and file reads for the whole process. Wrapping each native
 * call site in a limiter keeps `sum(limits) < UV_THREADPOOL_SIZE` so the pool always has
 * free threads for the event loop's own needs.
 *
 * @example
 * ```ts
 * const limitImageJobs = createLimiter(2);
 * const png = await limitImageJobs(() => sharp(input).png().toBuffer());
 * ```
 */
export interface Limiter {
	<T>(task: () => Promise<T>): Promise<T>;
	/** Tasks currently running */
	active(): number;
	/** Tasks waiting for a slot */
	pending(): number;
}

/**
 * Create a limiter that runs at most `maxConcurrent` tasks at once; extra tasks wait FIFO.
 *
 * @param maxConcurrent Maximum number of tasks allowed to run concurrently (≥ 1)
 */
export function createLimiter(maxConcurrent: number): Limiter {
	if (!Number.isInteger(maxConcurrent) || maxConcurrent < 1) {
		throw new RangeError(`maxConcurrent must be a positive integer, got ${maxConcurrent}`);
	}

	let active = 0;
	const waiting: Array<() => void> = [];

	function acquire(): Promise<void> {
		if (active < maxConcurrent) {
			active++;
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			waiting.push(() => {
				active++;
				resolve();
			});
		});
	}

	function release(): void {
		active--;
		waiting.shift()?.();
	}

	const limiter = async function <T>(task: () => Promise<T>): Promise<T> {
		await acquire();
		try {
			return await task();
		} finally {
			release();
		}
	} as Limiter;

	limiter.active = () => active;
	limiter.pending = () => waiting.length;

	return limiter;
}
