import type { PerformanceTuple } from 'trade-executor/schemas/utility-types';
import { error, json } from '@sveltejs/kit';
import { timeBucketEnum } from '$lib/schemas/utility.js';
import { configuredStrategies } from 'trade-executor/schemas/configuration';
import { getDateParam } from '$lib/helpers/url-params.js';
import { fetchChartData } from 'trade-executor/client/chart.js';
import { timeBucketToIntervalParts, dateToTs, tsToDate } from '$lib/charts/helpers';
import { relativeReturn } from '$lib/helpers/financial.js';

const periodTimeBuckets = timeBucketEnum.exclude(['1m', '5m', '15m']).options;

type PeriodTimeBucket = (typeof periodTimeBuckets)[number];

// Used to a add a buffer to time periods when checking for entries in-range
const PERIOD_BUFFER_MINUTES = 5;

/**
 * Return an array of period performance summaries
 */
export async function GET({ fetch, params, url }) {
	// verify strategy is configured
	const strategy = configuredStrategies.get(params.strategy);
	if (!strategy) error(404, 'Not found');

	// parse `end` param (default to current date)
	const endDate = getDateParam(url.searchParams, 'end') ?? new Date();

	// get performance data
	const { data } = await fetchChartData(fetch, strategy.url, {
		source: 'live_trading',
		type: strategy.useSharePrice ? 'share_price_based_return' : 'compounding_unrealised_trading_profitability_sampled'
	});

	// find the last entry prior to requested end date and use this as end target instead
	// (this helps maximize the data points found per period since strategies run on regular cycles)
	const endTs = dateToTs(endDate);
	const lastEntry = data.findLast(([ts]) => ts <= endTs);

	// return empty JSON array response if no lastEntry found
	if (!lastEntry) return json([]);

	// get performance summaries for specified time buckets
	const performanceSummaries = periodTimeBuckets.map((timeBucket) => {
		return getPerformanceSummary(data, timeBucket, lastEntry);
	});

	// return JSON response object
	return json(performanceSummaries);
}

/**
 * Summarize performance of strategy for a given time interval
 */
function getPerformanceSummary(data: PerformanceTuple[], timeBucket: PeriodTimeBucket, lastEntry: PerformanceTuple) {
	// get the last entry date
	const end = tsToDate(lastEntry[0]);

	// find the start time based on end and interval
	const [interval, duration] = timeBucketToIntervalParts(timeBucket);
	const start = interval.offset(end, -duration);

	// add a small buffer to the start time due to variability in cycle times
	start.setUTCMinutes(start.getUTCMinutes() - PERIOD_BUFFER_MINUTES);

	// get the start and end timestamps as they are needed for iterator comparisions
	const startTs = dateToTs(start);
	const endTs = dateToTs(end);

	// find the first entry within the interval time window
	const firstEntry = data.find(([ts]) => ts >= startTs && ts <= endTs);

	const performance = firstEntry !== lastEntry ? relativeReturn(firstEntry?.[1], lastEntry?.[1]) : undefined;

	return {
		timeBucket,
		start,
		end,
		first: firstEntry ? tsToDate(firstEntry?.[0]) : null,
		performance: performance ?? null
	};
}
