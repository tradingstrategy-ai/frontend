/**
 * Shared, bounded DuckDB access for the parquet-backed chart endpoints.
 *
 * `DuckDBConnection.create()` with no arguments uses a process-wide instance configured with
 * every CPU core and 80 % of RAM, and each query holds a libuv threadpool thread while it
 * runs — the same pool `dns.lookup` and `fs` depend on. This module replaces that with one
 * explicitly sized instance and a concurrency limit so DuckDB can never occupy the whole pool.
 *
 * Tunables (set in the container environment, no code change needed):
 *
 * - `TS_PRIVATE_DUCKDB_THREADS` — default `max(1, floor(cores / 2))`
 * - `TS_PRIVATE_DUCKDB_MEMORY_LIMIT` — default `1GB` (the full-file GROUP BY queries run
 *   comfortably under 512 MB on the 2025 parquet)
 *
 * @example
 * ```ts
 * const rows = await withDuckDb(async (connection) => {
 *   const reader = await connection.runAndReadAll('SELECT 42');
 *   return reader.getRows();
 * });
 * ```
 */
import { cpus } from 'node:os';
import { DuckDBInstance, type DuckDBConnection } from '@duckdb/node-api';
import { env } from '$env/dynamic/private';
import { createLimiter } from './concurrency-limit';

export const MAX_CONCURRENT_DUCKDB_QUERIES = 2;
const DEFAULT_MEMORY_LIMIT = '1GB';

let instance: Promise<DuckDBInstance> | undefined;

/** Run a DuckDB job once a slot is free; see {@link MAX_CONCURRENT_DUCKDB_QUERIES}. */
export const runDuckDbJob = createLimiter(MAX_CONCURRENT_DUCKDB_QUERIES);

function defaultThreads(): string {
	return String(Math.max(1, Math.floor(cpus().length / 2)));
}

function getInstance(): Promise<DuckDBInstance> {
	instance ??= DuckDBInstance.create(':memory:', {
		threads: env.TS_PRIVATE_DUCKDB_THREADS?.trim() || defaultThreads(),
		memory_limit: env.TS_PRIVATE_DUCKDB_MEMORY_LIMIT?.trim() || DEFAULT_MEMORY_LIMIT
	}).catch((cause) => {
		// Do not cache a failed instance; let the next caller retry.
		instance = undefined;
		throw cause;
	});
	return instance;
}

/**
 * Open a connection on the shared instance, run `work`, and always close the connection.
 * Waits for a concurrency slot first, so callers should resolve inputs (e.g. the parquet
 * path) before calling to keep slot hold time to the query itself.
 *
 * @param work Callback receiving an open connection
 */
export function withDuckDb<T>(work: (connection: DuckDBConnection) => Promise<T>): Promise<T> {
	return runDuckDbJob(async () => {
		const connection = await (await getInstance()).connect();
		try {
			return await work(connection);
		} finally {
			connection.closeSync();
		}
	});
}
