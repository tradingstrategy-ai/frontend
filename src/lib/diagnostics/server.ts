/**
 * Opt-in, server-side timing logs for tracking blocked upstream requests.
 *
 * Set `DIAGNOSE=1` in the frontend container to emit these logs. Keep this
 * disabled during normal operation: each server-side fetch produces a log line.
 */
import { env } from '$env/dynamic/private';

function isDiagnoseEnabled(): boolean {
	return env.DIAGNOSE === '1' || env.DIAGNOSE === 'true';
}

function elapsedMilliseconds(startedAt: number): string {
	return `${Math.round(performance.now() - startedAt)}ms`;
}

/**
 * Run an operation with opt-in start, completion and failure timing logs.
 *
 * @param label A safe description that contains no credentials.
 * @param operation The asynchronous operation to trace.
 */
export async function diagnose<T>(label: string, operation: () => Promise<T>): Promise<T> {
	if (!isDiagnoseEnabled()) return operation();

	const startedAt = performance.now();
	console.log(`[DIAGNOSE] start ${label}`);

	try {
		const result = await operation();
		console.log(`[DIAGNOSE] done ${label} in ${elapsedMilliseconds(startedAt)}`);
		return result;
	} catch (error) {
		const errorName = error instanceof Error ? error.name : 'UnknownError';
		console.log(`[DIAGNOSE] failed ${label} in ${elapsedMilliseconds(startedAt)} (${errorName})`);
		throw error;
	}
}

/**
 * Log a SvelteKit server-side request without exposing credentials in its URL.
 *
 * @param request The outgoing request.
 * @param fetchFn SvelteKit's server-side fetch function.
 */
export async function diagnoseFetch(request: Request, fetchFn: typeof fetch): Promise<Response> {
	if (!isDiagnoseEnabled()) return fetchFn(request);

	const url = new URL(request.url);
	url.username = '';
	url.password = '';
	url.search = '';
	url.hash = '';
	const label = `HTTP ${request.method} ${url.toString()}`;

	const startedAt = performance.now();
	console.log(`[DIAGNOSE] start ${label}`);

	try {
		const response = await fetchFn(request);
		console.log(`[DIAGNOSE] done ${label} HTTP ${response.status} in ${elapsedMilliseconds(startedAt)}`);
		return response;
	} catch (error) {
		const errorName = error instanceof Error ? error.name : 'UnknownError';
		console.log(`[DIAGNOSE] failed ${label} in ${elapsedMilliseconds(startedAt)} (${errorName})`);
		throw error;
	}
}
