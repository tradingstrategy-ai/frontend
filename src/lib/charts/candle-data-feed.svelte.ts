import type { AutoscaleInfo, UTCTimestamp } from 'lightweight-charts';
import type { CandleDataItem, DataFeed, TvDataItem } from './types';
import { chartWickThreshold } from '$lib/config';
import { untrack } from 'svelte';
import { parseDate } from '$lib/helpers/date';
import { utcMinute, utcHour, utcDay } from 'd3-time';
import { fetchPublicApi } from '$lib/helpers/public-api';

export type ApiCandle = {
	ts: string;
	o: number;
	h: number;
	l: number;
	c: number;
	v?: number;
};

export type CandleTimeBucket = (typeof CandleDataFeed.timeBuckets)[number];

const timeUnitIntervals = {
	m: utcMinute,
	h: utcHour,
	d: utcDay
} as const;

export type TimeUnit = keyof typeof timeUnitIntervals;

function tsToUnixTimestamp(ts: string) {
	return (new Date(`${ts}Z`).valueOf() / 1000) as UTCTimestamp;
}

function apiToDataItem(c: ApiCandle): CandleDataItem {
	return {
		time: tsToUnixTimestamp(c.ts),
		open: c.o,
		high: c.h,
		low: c.l,
		close: c.c,
		customValues: { volume: c.v }
	};
}

/**
 * Custom PriceScaleCalculator for trading pair price candle data
 *
 * By default, TradingView CandlestickSeries determines price scale using min/max
 * of all currently displayed candle values. For trading pairs with extremely long
 * wicks (high/low values), this results in an overly flattened-out price scale.
 * E.g.: http://localhost:5173/trading-view/arbitrum/uniswap-v3/crv-eth-fee-30
 *
 * calculateClippedCandleScale address this by clipping the high/low values based on a
 * configurable threshold.
 */
export function calculateClippedCandleScale(candles: TvDataItem[]): AutoscaleInfo | null {
	if (candles.length === 0) return null;

	const priceRange = (candles as CandleDataItem[]).reduce(
		({ minValue, maxValue }, { open, high, low, close }) => {
			const clippedLow = Math.max(low, Math.min(open, close) * (1 - chartWickThreshold));
			const clippedHigh = Math.min(high, Math.max(open, close) * (1 + chartWickThreshold));
			return {
				minValue: Math.min(minValue, clippedLow),
				maxValue: Math.max(maxValue, clippedHigh)
			};
		},
		// initial accumulator: ±Infinity ensures any candle value will be lower/higher
		{ minValue: Infinity, maxValue: -Infinity }
	);

	return { priceRange };
}

export class CandleDataFeed implements DataFeed<CandleDataItem> {
	static timeBuckets = ['1m', '5m', '15m', '1h', '4h', '1d', '7d', '30d'] as const;

	loading = $state(false);
	hasMoreData = $state(true);
	data = $state([]) as CandleDataItem[];

	constructor(
		readonly fetch: Fetch,
		readonly endpoint: string,
		readonly timeBucket: CandleTimeBucket,
		readonly urlParams: Record<string, string> = {}
	) {
		// fetch initial data
		// must be wrapped in `untrack` to prevent `state_unsafe_local_read` error
		// https://svelte.dev/docs/svelte/runtime-errors#Client-errors-state_unsafe_local_read
		untrack(() => this.fetchData());
	}

	get loadingInitialData() {
		return this.loading && this.data.length === 0;
	}

	get hasData() {
		return this.hasMoreData || this.data.length > 0;
	}

	get interval() {
		const [durationStr, timeUnit] = this.timeBucket.split(/(?=[mhd])/) as [`${number}`, TimeUnit];
		const timeUnitInterval = timeUnitIntervals[timeUnit];
		const duration = Number(durationStr);
		return timeUnitInterval.every(duration)!;
	}

	async fetchData(ticks = 200) {
		if (!this.hasMoreData || this.loading) return;
		this.loading = true;

		const interval = this.interval;
		const lastDate = parseDate(this.data[0]?.time);
		const endDate = lastDate ? interval.offset(lastDate, -1) : interval.ceil(new Date());
		const startDate = interval.offset(endDate, -ticks);

		const candleData = await fetchPublicApi(this.fetch, this.endpoint, {
			...this.urlParams,
			time_bucket: this.timeBucket,
			start: startDate.toISOString().slice(0, 19),
			end: endDate.toISOString().slice(0, 19)
		});

		const apiCandles = Object.values(candleData)[0] as ApiCandle[] | undefined;

		if (!apiCandles?.length) {
			this.hasMoreData = false;
		} else {
			const chartCandles = apiCandles.map(apiToDataItem);
			this.data = [...chartCandles, ...this.data];
		}

		this.loading = false;
	}
}
