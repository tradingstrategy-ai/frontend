import { dateToTs } from '$lib/charts/helpers';
import { parseDate } from '$lib/helpers/date.js';
import { relativeReturn } from '$lib/helpers/financial.js';
import { error, json } from '@sveltejs/kit';
import { utcDay, utcHour, utcMinute } from 'd3-time';
import { getStrategyInfo } from 'trade-executor/client/strategy-info.js';
import { configuredStrategies } from 'trade-executor/schemas/configuration';

// return an array of period performance summaries
export async function GET({ params, url }) {
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

	// get performance summaries for various intervals
	const intervals = ['1h', '4h', '1d', '7d', '30d'] as const;
	const data = strategy.summary_statistics?.compounding_unrealised_trading_profitability!;
	const performanceSummaries = intervals.map((interval) => getPerformanceSummary(data, endDate, interval));

	return json(performanceSummaries);
}

type TimeInterval = `${number}${'m' | 'h' | 'd'}`;

// check performance of strategy over time interval
function getPerformanceSummary(data: [number, number][], endDate: Date, timeInterval: TimeInterval) {
	const intervalMap = { m: utcMinute, h: utcHour, d: utcDay } as const;
	const [durationStr, timeUnit] = timeInterval.split(/(?=[mhd])/) as [`${number}`, keyof typeof intervalMap];
	const interval = intervalMap[timeUnit];
	const duration = Number(durationStr);

	const startDate = interval.offset(endDate, -duration);

	const startTs = dateToTs(startDate);
	const endTs = dateToTs(endDate);

	const startValue = data.findLast(([ts]) => ts < startTs)!;
	const endValue = data.findLast(([ts]) => ts < endTs)!;

	const performance = relativeReturn(startValue[1], endValue[1]);

	return {
		interval: timeInterval,
		start: startDate,
		end: endDate,
		performance
	};
}
