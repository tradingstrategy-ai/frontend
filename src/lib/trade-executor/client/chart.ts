/**
 * Chart data fetching functions.
 *
 * Calls to web_chart API endpoint.
 */
import type { RawTick } from '$lib/chart';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';

type ChartSource = 'live_trading' | 'backtest';
// See WebChartType https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/visual/web_chart.py#L14
type ChartType =
	| 'compounding_realised_profitability'
	| 'compounding_unrealised_trading_profitability_sampled'
	| 'total_equity'
	| 'netflow';

export type ChartRequestParams = {
	type: ChartType;
	source: ChartSource;
};

/**
 * Describe chart data
 *
 * See https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/visual/web_chart.py
 */
export interface WebChartData {
	data: RawTick[];
	title: string;
	help_link: string;
	source: ChartSource;
}

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
	params: ChartRequestParams
): Promise<WebChartData> {
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

	return resp.json();
}

export type WebChartClientData = Partial<WebChartData> & {
	loading?: boolean;
	error?: Error;
};

export function getChartClient(fetchFn: Fetch, executorUrl: string) {
	const { set, subscribe } = writable({} as WebChartClientData);

	async function fetch(params: ChartRequestParams) {
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
