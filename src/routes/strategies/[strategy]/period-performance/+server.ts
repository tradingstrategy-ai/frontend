import { error, json } from '@sveltejs/kit';
import { dateToTs, timeBucketToIntervalParts } from '$lib/charts/helpers';
import { getDateParam } from '$lib/helpers/url-params.js';
import { relativeReturn, annualizedReturn } from '$lib/helpers/financial.js';
import { timeBucketEnum } from '$lib/schemas/utility.js';
import { fetchChartData } from 'trade-executor/client/chart.js';
import { configuredStrategies } from 'trade-executor/schemas/configuration';

const periodTimeBuckets = timeBucketEnum.exclude(['1m', '5m', '15m']).options;

type PeriodTimeBucket = (typeof periodTimeBuckets)[number];

/**
 * Return an array of period performance summaries
 */
export async function GET({ fetch, params, url }) {
	// verify strategy is configured
	const strategy = configuredStrategies.get(params.strategy);
	if (!strategy) error(404, 'Not found');

	// parse `end` param, default to current date
	const endDate = getDateParam(url.searchParams, 'end') ?? new Date();

	// get performance data
	const { data } = await fetchChartData(fetch, strategy.url, {
		source: 'live_trading',
		type: strategy.useSharePrice ? 'share_price_based_return' : 'compounding_unrealised_trading_profitability_sampled'
	});

	// get performance summaries for specified time buckets
	const performanceSummaries = periodTimeBuckets.map((timeBucket) => getPerformanceSummary(data, endDate, timeBucket));

	// return JSON response object
	return json(performanceSummaries);
}

/**
 * Summarize performance of strategy for a given time interval
 */
function getPerformanceSummary(data: [number, number][], end: Date, timeBucket: PeriodTimeBucket) {
	const [interval, duration] = timeBucketToIntervalParts(timeBucket);
	const start = interval.offset(end, -duration);

	const startTs = dateToTs(start);
	const endTs = dateToTs(end);

	const first = data.findLast(([ts]) => ts < startTs)!;
	const last = data.findLast(([ts]) => ts < endTs)!;

	const performance = relativeReturn(first?.[1], last?.[1]);
	const annualized = performance && annualizedReturn(start, end, performance);

	return {
		timeBucket,
		start: start,
		end: end,
		performance: performance ?? null,
		annualizedReturn: annualized ?? null
	};
}
