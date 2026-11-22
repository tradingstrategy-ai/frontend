import { describe, expect, it, vi } from 'vitest';
import { createCacheScheduler } from './cache-scheduler.js';

const silentLog = { warn: vi.fn(), error: vi.fn() };

describe('createCacheScheduler', () => {
	it('runs the all job first and then every third tick', async () => {
		const jobs = [];
		const scheduler = createCacheScheduler({ trigger: async (job) => void jobs.push(job), log: silentLog });
		for (let i = 0; i < 7; i++) await scheduler.runTick();
		expect(jobs).toEqual(['all', 'frequent', 'frequent', 'all', 'frequent', 'frequent', 'all']);
	});

	it('never overlaps jobs and runs a skipped all job on the next tick', async () => {
		const jobs = [];
		let finish;
		const trigger = vi.fn(async (job) => {
			jobs.push(job);
			if (job === 'frequent' && !finish) await new Promise((resolve) => (finish = resolve));
		});
		const scheduler = createCacheScheduler({ trigger, log: silentLog });

		await scheduler.runTick(); // all
		const slow = scheduler.runTick(); // frequent, hangs
		await scheduler.runTick(); // frequent: skipped
		await scheduler.runTick(); // all: skipped, remembered
		finish();
		await slow;
		await scheduler.runTick(); // would be frequent, runs the pending all
		await scheduler.runTick(); // frequent

		expect(jobs).toEqual(['all', 'frequent', 'all', 'frequent']);
		expect(trigger).toHaveBeenCalledTimes(4);
	});

	it('keeps scheduling after a failed job', async () => {
		const log = { warn: vi.fn(), error: vi.fn() };
		const trigger = vi.fn().mockRejectedValueOnce(new Error('HTTP 503')).mockResolvedValue(undefined);
		const scheduler = createCacheScheduler({ trigger, log });
		await scheduler.runTick();
		await scheduler.runTick();
		expect(trigger).toHaveBeenCalledTimes(2);
		expect(log.error).toHaveBeenCalledWith('[cache-warmer] all job failed (Error: HTTP 503).');
	});
});
