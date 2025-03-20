import type { CandlestickData, UTCTimestamp } from 'lightweight-charts';
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

export type ChartCandle = CandlestickData<UTCTimestamp>;

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

export class CandleDataFeed {
	static timeBuckets = ['1m', '5m', '15m', '1h', '4h', '1d', '7d', '30d'] as const;

	loading = $state(false);
	data = $state([]) as ChartCandle[];

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

	get interval() {
		const [durationStr, timeUnit] = this.timeBucket.split(/(?=[mhd])/) as [`${number}`, TimeUnit];
		const timeUnitInterval = timeUnitIntervals[timeUnit];
		const duration = Number(durationStr);
		return timeUnitInterval.every(duration)!;
	}

	async fetchData(ticks = 200) {
		if (this.loading) return;
		this.loading = true;

		const interval = this.interval;
		const lastDate = parseDate(this.data[0]?.time);
		const endDate = lastDate ? interval.offset(lastDate, -1) : interval.ceil(new Date());
		const startDate = interval.offset(endDate, -ticks);

		const candleData = (await fetchPublicApi(this.fetch, this.endpoint, {
			...this.urlParams,
			time_bucket: this.timeBucket,
			start: startDate.toISOString().slice(0, 19),
			end: endDate.toISOString().slice(0, 19)
		})) as Record<number, ApiCandle[]>;

		const candles = Object.values(candleData)[0].map(({ o, h, l, c, v, ts }) => {
			return {
				time: tsToUnixTimestamp(ts),
				open: o,
				high: h,
				low: l,
				close: c,
				customValues: {
					volume: v
				}
			} as ChartCandle;
		});

		this.data = [...candles, ...this.data];
		this.loading = false;
	}
}
