import { afterEach, describe, expect, test, vi } from 'vitest';
import { resetCacheWarmerForTests, runWarmTasks, type WarmTask } from './cache-warmer';

const fetchStub = vi.fn() as unknown as Fetch;

afterEach(() => {
	resetCacheWarmerForTests();
	vi.restoreAllMocks();
});

function task(name: string, run: WarmTask['run'], timeoutMs = 1_000): WarmTask {
	return { name, timeoutMs, run };
}

describe('runWarmTasks', () => {
	test('runs tasks one after another in order', async () => {
		const order: string[] = [];
		let running = 0;
		let maxRunning = 0;
		const step = (name: string) =>
			task(name, async () => {
				running++;
				maxRunning = Math.max(maxRunning, running);
				await new Promise((resolve) => setTimeout(resolve, 5));
				order.push(name);
				running--;
			});

		const results = await runWarmTasks([step('a'), step('b'), step('c')], fetchStub);
		expect(order).toEqual(['a', 'b', 'c']);
		expect(maxRunning).toBe(1);
		expect(results.map((result) => result.status)).toEqual(['ok', 'ok', 'ok']);
	});

	test('a failing task does not stop the ones after it', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const after = vi.fn(async () => {});
		const results = await runWarmTasks(
			[
				task('broken', async () => {
					throw new Error('upstream down');
				}),
				task('after', after)
			],
			fetchStub
		);
		expect(after).toHaveBeenCalled();
		expect(results[0]).toMatchObject({ name: 'broken', status: 'failed', error: 'Error: upstream down' });
		expect(results[1].status).toBe('ok');
	});

	test('a task past its deadline is aborted, and is skipped until it has really stopped', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		let finish!: () => void;
		let receivedSignal: AbortSignal | undefined;
		const slow = vi.fn(
			(_fetch: Fetch, signal: AbortSignal) =>
				new Promise<void>((resolve) => {
					receivedSignal = signal;
					finish = resolve;
				})
		);

		const first = await runWarmTasks([task('slow', slow, 10), task('next', async () => {})], fetchStub);
		expect(first.map((result) => result.status)).toEqual(['timed out', 'ok']);
		expect(receivedSignal?.aborted).toBe(true);

		// the ignored abort leaves the work running: a second run must not start another copy
		const second = await runWarmTasks([task('slow', slow, 10)], fetchStub);
		expect(second[0].status).toBe('still running');
		expect(slow).toHaveBeenCalledTimes(1);

		finish();
		await new Promise((resolve) => setTimeout(resolve, 0));
		const third = await runWarmTasks([task('slow', async () => {}, 10)], fetchStub);
		expect(third[0].status).toBe('ok');
	});

	test('reports duration and memory for each task', async () => {
		const [result] = await runWarmTasks([task('measured', async () => {})], fetchStub);
		expect(result.durationMs).toBeGreaterThanOrEqual(0);
		expect(result.rssMb).toBeGreaterThan(0);
	});
});
