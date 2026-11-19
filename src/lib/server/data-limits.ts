/**
 * Deadlines and a concurrency cap for server-side data work: DuckDB scans of the vault
 * price parquet and the R2 requests that keep it fresh.
 *
 * DuckDB's Node bindings run queries on the libuv thread pool (`UV_THREADPOOL_SIZE=8` in
 * the Dockerfile), which file-system calls, DNS lookups and static file serving share. On
 * 2026-11-19 work that never finished held every thread: static files, `/vaults/<id>/metrics`,
 * the vault hub mini charts and the glossary (its `fetch` needs a DNS lookup) all hung until
 * Cloudflare answered 504, while SSR pages without file-system work still rendered. So at
 * most `MAX_CONCURRENT_DUCKDB_QUERIES` queries run at once, leaving threads for everything
 * else, and every wait has a deadline after which the caller gets a 503.
 */
import { error } from '@sveltejs/kit';
import { DuckDBConnection } from '@duckdb/node-api';

/** Default deadline for a data request: DuckDB query, R2 request or first parquet download. */
export const DATA_TIMEOUT_MS = 90_000;

/** Half of the libuv thread pool; the rest stays free for file-system and DNS work. */
export const MAX_CONCURRENT_DUCKDB_QUERIES = 4;

/** Throw the 503 that endpoints and loaders return when data work misses its deadline. */
function dataUnavailable(label: string, timeoutMs: number): never {
	console.error(`${label} did not finish within ${timeoutMs} ms`);
	error(503, 'Vault data is temporarily unavailable, please try again later');
}

/**
 * Wait for `promise` until `timeoutMs` has passed, then throw a 503. The underlying work is
 * not cancelled; pass `onTimeout` to cancel it.
 *
 * @param promise work to wait for
 * @param timeoutMs deadline in milliseconds
 * @param label name used in the log line
 * @param onTimeout called once when the deadline passes
 */
export async function withDataTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	label: string,
	onTimeout?: () => void
): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const deadline = new Promise<never>((_, reject) => {
		timer = setTimeout(() => {
			onTimeout?.();
			try {
				dataUnavailable(label, timeoutMs);
			} catch (e) {
				reject(e);
			}
		}, timeoutMs);
	});

	try {
		return await Promise.race([promise, deadline]);
	} finally {
		clearTimeout(timer);
	}
}

let activeQueries = 0;
const queuedQueries: (() => void)[] = [];

function releaseQuerySlot() {
	const next = queuedQueries.shift();
	if (next) next();
	else activeQueries--;
}

/** Take a query slot, or wait for one until `timeoutMs` has passed. */
async function acquireQuerySlot(label: string, timeoutMs: number): Promise<void> {
	if (activeQueries < MAX_CONCURRENT_DUCKDB_QUERIES) {
		activeQueries++;
		return;
	}

	let grant!: () => void;
	const granted = new Promise<void>((resolve) => {
		grant = resolve;
	});
	queuedQueries.push(grant);

	await withDataTimeout(granted, timeoutMs, `${label} (waiting for a query slot)`, () => {
		const index = queuedQueries.indexOf(grant);
		if (index >= 0) queuedQueries.splice(index, 1);
	});
}

/**
 * Run DuckDB work on a fresh connection within the concurrency cap and a deadline.
 *
 * Time spent waiting for a slot counts towards the deadline. When it passes, the query is
 * interrupted and the caller gets a 503 straight away; the slot is only released once the
 * interrupted query has actually stopped, so stuck queries cannot pile up beyond the cap.
 *
 * @param label name used in log lines, e.g. `vault metrics <id>`
 * @param work queries to run on the connection
 * @param timeoutMs deadline in milliseconds, `DATA_TIMEOUT_MS` by default
 */
export async function withDuckDbConnection<T>(
	label: string,
	work: (connection: DuckDBConnection) => Promise<T>,
	timeoutMs = DATA_TIMEOUT_MS
): Promise<T> {
	const startedAt = Date.now();
	await acquireQuerySlot(label, timeoutMs);

	let connection: DuckDBConnection;
	try {
		connection = await DuckDBConnection.create();
	} catch (e) {
		releaseQuerySlot();
		throw e;
	}

	const running = work(connection);
	running
		.catch(() => {
			// The caller sees the error (or has already received the timeout).
		})
		.finally(() => {
			connection.closeSync();
			releaseQuerySlot();
		});

	const remainingMs = Math.max(timeoutMs - (Date.now() - startedAt), 0);
	return withDataTimeout(running, remainingMs, label, () => connection.interrupt());
}
