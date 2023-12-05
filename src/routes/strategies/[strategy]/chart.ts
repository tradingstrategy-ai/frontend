/**
 * Chart data fetching functions.
 *
 * Calls to web_chart API endpoint.
 */
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';

type Pair<T, K> = [T, K];
type Pairs<T, K> = Pair<T, K>[];

type UnixTimestamp = number;
type Percent = number;
type USDollar = number;

type ChartSource = 'live_trading' | 'backtest';
// See WebChartType https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/visual/web_chart.py#L14
type ChartType = 'compounding_realised_profitability' | 'total_equity' | 'netflow';

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
	data: Pairs<UnixTimestamp, Percent | USDollar>;
	title: string;
	help_link: string;
	source: ChartSource;
	// "all"
	time_window: string;
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
		throw error(503, { message: 'Service Unavailable', stack });
	}

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

	return resp.json();
}
