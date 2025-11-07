import type { TimeInterval } from 'd3-time';
import type { TimeBucket } from '$lib/schemas/utility.js';
import type { TradingPositionInfo } from 'trade-executor/models/position-info.js';
import type { TradingPairInfo } from 'trade-executor/models/trading-pair-info.js';
import type { ApiCandle } from '$lib/charts/types.js';
import { error } from '@sveltejs/kit';
import { fetchPublicApi } from '$lib/helpers/public-api.js';
import { apiCandleToDataItem } from '$lib/charts/candle-data-feed.svelte.js';
import { timeBucketToInterval } from '$lib/charts/helpers.js';

export const ssr = false;

type IntervalInfo = {
	timeBucket: TimeBucket;
	interval: TimeInterval;
	start: Date;
	end: Date;
};

export async function load({ fetch, params, parent }) {
	// only render for closed positions
	if (params.status !== 'closed') error(404);

	// only supports spot positions for now
	const { position } = await parent();
	if (position.isCreditPosition) error(404);

	const pairId = String(position.pair.internal_id);
	const exchangeType = getExchangeType(position.pair);
	const { timeBucket, interval, start, end } = getIntervalInfo(position);

	const rawCandleData = await fetchPublicApi<Record<string, ApiCandle[]>>(fetch, 'candles', {
		candle_type: 'price',
		pair_id: pairId,
		exchange_type: exchangeType,
		time_bucket: timeBucket,
		start: start.toISOString().slice(0, 19),
		end: end.toISOString().slice(0, 19)
	});

	const candleData = rawCandleData[pairId].map(apiCandleToDataItem);

	return {
		timeBucket,
		interval,
		start,
		end,
		candleData,

		// skip unneeded layout items (page used only for generating social media image)
		skipNavbar: true,
		skipBreadcrumbs: true,
		skipFooter: true
	};
}

// assume uniswap_v2 unless exchange name is "uniswap-v3"
function getExchangeType(pair: TradingPairInfo) {
	return pair.exchange_name === 'uniswap-v3' ? 'uniswap_v3' : 'uniswap_v2';
}

// find the largest interval (and related properties) that yields at least 8 candles
const MIN_CANDLES = 8;
type ReducerState = IntervalInfo & { done: boolean };
function getIntervalInfo(position: TradingPositionInfo): IntervalInfo {
	return (['1d', '4h', '1h'] as TimeBucket[]).reduce<ReducerState>(
		(acc, timeBucket) => {
			if (acc.done) return acc; // exit eagerly if already done

			const interval = timeBucketToInterval(timeBucket);
			const start = interval.offset(interval.floor(position.opened_at), -2);
			const end = interval.ceil(position.closed_at!);
			const done = interval.range(start, end).length >= MIN_CANDLES;

			return { timeBucket, interval, start, end, done };
		},
		{ done: false } as ReducerState
	);
}
