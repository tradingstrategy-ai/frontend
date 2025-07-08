import { error } from '@sveltejs/kit';
import { configuredStrategies } from 'trade-executor/schemas/configuration';
import { getStrategyInfo } from 'trade-executor/client/strategy-info';
import { fetchChartData } from 'trade-executor/client/chart';
import { getDateParam } from '$lib/helpers/url-params.js';
import { normalizeDataForInterval } from '$lib/charts/helpers';
import { utcHour } from 'd3-time';

export async function load({ fetch, params, url }) {
	const strategyConf = configuredStrategies.get(params.strategy);
	if (!strategyConf) error(404, 'Not found');

	const strategy = await getStrategyInfo(fetch, strategyConf);

	const { searchParams } = url;
	const startDate = getDateParam(searchParams, 'start');
	const endDate = getDateParam(searchParams, 'end');

	if (!startDate || !endDate) {
		error(400, 'start and end query params required');
	}

	const { data } = await fetchChartData(fetch, strategy.url, {
		source: 'live_trading',
		type: strategy.useSharePrice ? 'share_price_based_return' : 'compounding_unrealised_trading_profitability_sampled'
	});

	return {
		strategy,
		chartData: normalizeDataForInterval(data, utcHour),
		dateRange: [startDate, endDate] as [Date, Date],
		// remove unneeded layout items (page used only for generating social media image)
		skipNavbar: true,
		skipFooter: true
	};
}
