/**
 * Chart data fetching functions.
 *
 * Calls to web_chart API endpoint.
 */
import type { WebChartSource, WebChartType, WebChart } from 'trade-executor/schemas/web-chart';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { webChartSchema } from 'trade-executor/schemas/web-chart';

export type WebChartRequestParams = {
	type: WebChartType;
	source: WebChartSource;
};

/**
 * Get the chart data for a named chart
 *
 * @param fetch SvelteKit's fetch function
 * @param executorUrl The webhook API URL for the strategy executor
 * @param params Object with `type` and `source` params
 */
export async function fetchChartData(
	fetch: Fetch,
	executorUrl: string,
	params: WebChartRequestParams
): Promise<WebChart> {
	let resp: Response;
	try {
		resp = await fetch(`${executorUrl}/chart?${new URLSearchParams(params)}`);
	} catch (e) {
		const stack = [`Error loading data from URL: ${executorUrl}`, e.message];
		error(503, { message: 'Service Unavailable', stack });
	}

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return webChartSchema.parse(await resp.json());
}

export type WebChartClientData = Partial<WebChart> & {
	loading?: boolean;
	error?: Error;
};

export type ChartClient = ReturnType<typeof getChartClient>;

export function getChartClient(fetchFn: Fetch, executorUrl: string) {
	const { set, subscribe } = writable({} as WebChartClientData);

	async function fetch(params: WebChartRequestParams) {
		// abort if called during SSR
		if (!browser) return;

		set({ loading: true });

		try {
			set(await fetchChartData(fetchFn, executorUrl, params));
		} catch (e) {
			set({ error: <Error>e });
		}
	}

	return { fetch, subscribe };
}
