import { isHttpError } from '@sveltejs/kit';
import { describe, expect, test } from 'vitest';
import { MAX_CONCURRENT_DUCKDB_QUERIES, withDataTimeout, withDuckDbConnection } from './data-limits';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('withDataTimeout', () => {
	test('returns the result when the work finishes in time', async () => {
		await expect(withDataTimeout(Promise.resolve('ok'), 100, 'quick work')).resolves.toBe('ok');
	});

	test('answers 503 and calls onTimeout when the deadline passes', async () => {
		let cancelled = false;
		const result = withDataTimeout(new Promise(() => {}), 10, 'stuck work', () => {
			cancelled = true;
		});

		await expect(result).rejects.toSatisfy((e) => isHttpError(e, 503));
		expect(cancelled).toBe(true);
	});
});

describe('withDuckDbConnection', () => {
	test('runs at most MAX_CONCURRENT_DUCKDB_QUERIES queries at once', async () => {
		let running = 0;
		let peak = 0;

		const results = await Promise.all(
			Array.from({ length: MAX_CONCURRENT_DUCKDB_QUERIES * 2 }, (_, index) =>
				withDuckDbConnection(`query ${index}`, async (connection) => {
					running++;
					peak = Math.max(peak, running);
					await sleep(20);
					const reader = await connection.runAndReadAll(`SELECT ${index}::INTEGER`);
					running--;
					return reader.getRows()[0][0];
				})
			)
		);

		expect(results).toEqual(Array.from({ length: MAX_CONCURRENT_DUCKDB_QUERIES * 2 }, (_, index) => index));
		expect(peak).toBe(MAX_CONCURRENT_DUCKDB_QUERIES);
	});

	test('interrupts a query that misses its deadline and frees its slot', async () => {
		const slow = withDuckDbConnection(
			'endless query',
			(connection) => connection.runAndReadAll('SELECT count(*) FROM range(1000000000000) a, range(1000) b'),
			200
		);

		await expect(slow).rejects.toSatisfy((e) => isHttpError(e, 503));

		// Every slot must be usable again once the interrupted query has stopped
		const after = await Promise.all(
			Array.from({ length: MAX_CONCURRENT_DUCKDB_QUERIES }, () =>
				withDuckDbConnection(
					'follow-up query',
					async (connection) => {
						const reader = await connection.runAndReadAll('SELECT 1');
						return reader.getRows()[0][0];
					},
					5_000
				)
			)
		);
		expect(after).toEqual(Array.from({ length: MAX_CONCURRENT_DUCKDB_QUERIES }, () => 1));
	}, 15_000);
});
