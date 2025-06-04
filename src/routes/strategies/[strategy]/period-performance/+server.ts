import { dateToTs, timeBucketToIntervalParts } from '$lib/charts/helpers';
import { parseDate } from '$lib/helpers/date.js';
import { relativeReturn, annualizedReturn } from '$lib/helpers/financial.js';
import { timeBucketEnum } from '$lib/schemas/utility.js';
import { error, json } from '@sveltejs/kit';
import { getStrategyInfo } from 'trade-executor/client/strategy-info.js';
import { configuredStrategies } from 'trade-executor/schemas/configuration';

const periodTimeBuckets = timeBucketEnum.exclude(['1m', '5m', '15m']).options;

type PeriodTimeBucket = (typeof periodTimeBuckets)[number];

// return an array of period performance summaries
export async function GET({ fetch, params, url }) {
	const strategyConf = configuredStrategies.get(params.strategy);
	if (!strategyConf) error(404, 'Not found');

	const strategy = await getStrategyInfo(fetch, strategyConf);

	// parse `end` param (if provided) and set `endDate` to provided value or current date
	const end = url.searchParams.get('end');
	const endDate = end ? parseDate(end) : new Date();

	// return error if invalid `end` param supplied
	if (!endDate) {
		error(400, 'param `end` must be a valid date string or timestamp (or omitted for current date)');
	}

	// get performance summaries for specified time buckets
	const data = strategy.summary_statistics?.compounding_unrealised_trading_profitability!;
	const performanceSummaries = periodTimeBuckets.map((timeBucket) => getPerformanceSummary(data, endDate, timeBucket));

	return json(performanceSummaries);
}

// check performance of strategy over time interval
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
