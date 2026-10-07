import { describe, expect, test } from 'vitest';
import { createLimiter } from './concurrency-limit';

function deferred<T = void>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

describe('createLimiter', () => {
	test('rejects non-positive limits', () => {
		expect(() => createLimiter(0)).toThrow(RangeError);
		expect(() => createLimiter(1.5)).toThrow(RangeError);
	});

	test('never runs more than the limit concurrently and drains FIFO', async () => {
		const limit = createLimiter(2);
		const gates = [deferred(), deferred(), deferred()];
		const started: number[] = [];

		const runs = gates.map((gate, index) =>
			limit(async () => {
				started.push(index);
				await gate.promise;
				return index;
			})
		);

		await Promise.resolve();
		expect(started).toEqual([0, 1]);
		expect(limit.active()).toBe(2);
		expect(limit.pending()).toBe(1);

		gates[0].resolve();
		await runs[0];
		await Promise.resolve();
		expect(started).toEqual([0, 1, 2]);

		gates[1].resolve();
		gates[2].resolve();
		await expect(Promise.all(runs)).resolves.toEqual([0, 1, 2]);
		expect(limit.active()).toBe(0);
		expect(limit.pending()).toBe(0);
	});

	test('releases the slot when a task throws', async () => {
		const limit = createLimiter(1);

		await expect(limit(async () => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
		expect(limit.active()).toBe(0);

		await expect(limit(async () => 'ok')).resolves.toBe('ok');
	});
});
