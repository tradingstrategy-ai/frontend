/**
 * Chart fetching functions.
 *
 * Calls web_chart API endpoint.
 */
import {publicApiError} from "$lib/helpers/public-api";


type Pair<T,K> = [T,K];
type Pairs<T,K> = Pair<T,K>[];

type UnixTimestamp = number;
type Percent = number;
type USDollar = number;

/**
 * Describe chart data
 *
 * See https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/visual/web_chart.py
 */
export interface WebChart {
    data: Pairs<UnixTimestamp, Percent | USDollar>;
    title: string;
    help_link: string;
    // "live_trading" or "backtest"
    source: string;
    // "all"
    time_window: string;
}


/**
 * Get the chart data for a named chart
 *
 * @param executorUrl The webhook API URL for the strategy executor
 *
 * @param chartType See WebChartType https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/visual/web_chart.py#L14
 *
 * @param source "live_trading" or "backtest"
 *
 * @param fetch SvelteKit's fetch function
 *
 */
export async function getChartData(
    executorUrl: string,
    chartType: string,
    source: string,
	fetch
): Promise<WebChart> {
    let resp;
    resp = await fetch(`${executorUrl}/chart?` + new URLSearchParams({type: chartType}));

	if (!resp.ok) {
		throw await publicApiError(resp);
	}

    return resp.json();
}
