// Helpers for working with Trading Strategy public APIs
import { type NumericRange, error } from '@sveltejs/kit';
import { backendUrl } from '$lib/config';

type Params = Record<string, string>;

const controllers: Record<string, AbortController> = {};

/**
 * Fetch data from Trading Strategy backend endpoints
 *
 * @param fetch SvelteKit's fetch function
 * @param endpoint final path segment of endpoint, e.g.: 'chains', 'pairs'
 * @param params URL paramaters as a record of string values
 * @param abortPrevious set to true to abort pending requets to the same endpoint
 * @returns the deserialised JSON payload
 */
export async function fetchPublicApi(fetch: Fetch, endpoint: string, params: Params = {}, abortPrevious = false) {
	let signal: AbortSignal | undefined = undefined;

	if (abortPrevious) {
		controllers[endpoint]?.abort();
		controllers[endpoint] = new AbortController();
		signal = controllers[endpoint].signal;
	}

	const searchParams = new URLSearchParams(params);

	try {
		const resp = await fetch(`${backendUrl}/${endpoint}?${searchParams}`, { signal });
		if (!resp.ok) throw await publicApiError(resp);
		return resp.json();
	} catch (e) {
		if (e.name === 'AbortError') return;
		throw e;
	} finally {
		if (!signal?.aborted) delete controllers[endpoint];
	}
}

/**
 * Return appropriate error object for public API errors
 *
 * NOTE: Don't use this helper for APIs that may include sensitive data
 * in error message or stacktrace.
 */
export async function publicApiError(response: Response) {
	let status = response.status as NumericRange<400, 599>;
	if (status >= 500) status = 503;

	const stack: string[] = [];
	stack.push(`Error loading data from URL: ${response.url}`);
	stack.push(`${response.status} ${response.statusText}`);
	stack.push(await response.text());

	return error(status, { message: response.statusText, stack });
}

/**
 * Factory function to generate an error handler that can be used when fetching
 * optional data in order to fall back gracefully instead of throwing an error.
 *
 * Logs error to stderr and fails w/out re-throwing.
 *
 * @example
 * ```typescript
 *   import { optionalDataError } from '$lib/helpers/public-api';
 *
 *   export async function load({ fetch }) {
 *     return {
 *       impressiveNumbers: await fetchPublicApi(fetch, 'impressive-numbers').catch(optionalDataError('impressive-numbers')),
 *       posts: await getPosts(fetch).catch(optionalDataError('blog posts'))
 *     };
 *   }
 * ```
 *
 * @param dataType the type of data being requested, e.g.: 'impressive-numbers'
 * @returns error handler function that can be passed to Promise.catch
 */
export function optionalDataError(dataType?: string) {
	const errorIntro = dataType ? `Request for ${dataType} failed` : 'Request failed';
	return (err: Error) => {
		console.error(`${errorIntro}; rendering page without data.`);
		console.error(err);
	};
}
