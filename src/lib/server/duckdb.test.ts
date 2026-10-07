import { describe, expect, test } from 'vitest';
import { MAX_CONCURRENT_DUCKDB_QUERIES, runDuckDbJob, withDuckDb } from './duckdb';

describe('withDuckDb', () => {
	test('runs a query on the shared instance and closes the connection', async () => {
		const rows = await withDuckDb(async (connection) => {
			const reader = await connection.runAndReadAll('SELECT 42 AS answer');
			return reader.getRows();
		});

		expect(rows).toEqual([[42]]);
		expect(runDuckDbJob.active()).toBe(0);
	});

	test('applies the configured limits to the instance', async () => {
		const [threads, memoryLimit] = await withDuckDb(async (connection) => {
			const reader = await connection.runAndReadAll(
				"SELECT current_setting('threads'), current_setting('memory_limit')"
			);
			return reader.getRows()[0] as [bigint, string];
		});

		expect(Number(threads)).toBeGreaterThanOrEqual(1);
		expect(memoryLimit).toMatch(/MiB|GiB/);
	});

	test('releases its slot on query failure', async () => {
		await expect(withDuckDb((connection) => connection.runAndReadAll('SELECT * FROM missing_table'))).rejects.toThrow();
		expect(runDuckDbJob.active()).toBe(0);
		expect(MAX_CONCURRENT_DUCKDB_QUERIES).toBeLessThan(8);
	});
});
