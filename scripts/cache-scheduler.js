/**
 * Scheduler for the background cache warmer (`/_internal/cache/warm`, see
 * `src/lib/server/warm-tasks.ts`), used by `scripts/server.js`.
 *
 * It ticks every 20 minutes, starting at start-up. Every third tick (start-up, then hourly)
 * runs the `all` job, which refreshes every server-side data cache; the ticks between run
 * the `frequent` job (the `/strategies` snapshot and the home page blog roll).
 *
 * Only one job runs at a time, so the two can never overlap. A tick that finds a job still
 * running is skipped; if the skipped tick was an `all` tick, the next tick runs `all`
 * instead, so a slow `frequent` run cannot push the hourly refresh back by an hour.
 */

export const TICK_INTERVAL_MS = 20 * 60 * 1000;

/** Every this many ticks the `all` job runs (20 min × 3 = hourly). */
export const FULL_REFRESH_EVERY = 3;

/**
 * @param {object} options
 * @param {(job: 'all' | 'frequent') => Promise<void>} options.trigger run one job to completion
 * @param {number} [options.intervalMs] tick interval
 * @param {Pick<Console, 'warn' | 'error'>} [options.log]
 */
export function createCacheScheduler({ trigger, intervalMs = TICK_INTERVAL_MS, log = console }) {
	let tick = 0;
	let running = false;
	let fullRefreshPending = false;
	/** @type {ReturnType<typeof setInterval> | undefined} */
	let timer;

	async function runTick() {
		const scheduled = tick % FULL_REFRESH_EVERY === 0 ? 'all' : 'frequent';
		tick++;
		const job = fullRefreshPending ? 'all' : scheduled;

		if (running) {
			if (job === 'all') fullRefreshPending = true;
			log.warn(`[cache-warmer] ${job} job skipped because another job is still running.`);
			return;
		}

		running = true;
		fullRefreshPending = false;
		try {
			await trigger(job);
		} catch (error) {
			const summary = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error';
			log.error(`[cache-warmer] ${job} job failed (${summary}).`);
		} finally {
			running = false;
		}
	}

	return {
		/** Run the first (`all`) tick now and schedule the rest. */
		start() {
			void runTick();
			timer = setInterval(() => void runTick(), intervalMs);
			timer.unref?.();
		},
		stop() {
			clearInterval(timer);
		},
		/** Run the next tick now (tests). */
		runTick
	};
}
