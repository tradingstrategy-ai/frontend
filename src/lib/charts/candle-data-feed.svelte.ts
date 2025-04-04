import type { UTCTimestamp } from 'lightweight-charts';
import type { ApiCandle, CandleDataItem, CandleTimeBucket, DataFeed } from './types';
import { type TimeInterval, utcMinute, utcHour, utcDay } from 'd3-time';
import { fetchPublicApi } from '$lib/helpers/public-api';

const timeUnitIntervals = {
	m: utcMinute,
	h: utcHour,
	d: utcDay
} as const;

type TimeUnit = keyof typeof timeUnitIntervals;

export function tsToUnixTimestamp(ts: string) {
	return (new Date(`${ts}Z`).valueOf() / 1000) as UTCTimestamp;
}

export function apiCandleToDataItem(c: ApiCandle): CandleDataItem {
	return {
		time: tsToUnixTimestamp(c.ts),
		open: c.o,
		high: c.h,
		low: c.l,
		close: c.c
	};
}

export type ApiDataTransformer = (data: any) => CandleDataItem[];

export class CandleDataFeed implements DataFeed<CandleDataItem> {
	static timeBuckets: CandleTimeBucket[] = ['1m', '5m', '15m', '1h', '4h', '1d', '7d', '30d'];

	interval: TimeInterval;
	endDate: Date;
	loading = $state(false);
	hasMoreData = $state(true);
	data = $state([]) as CandleDataItem[];

	constructor(
		readonly fetch: Fetch,
		readonly endpoint: string,
		readonly timeBucket: CandleTimeBucket,
		readonly urlParams: Record<string, string> = {},
		readonly transformApiData: ApiDataTransformer
	) {
		this.interval = this.timeBucketToInterval(timeBucket);
		this.endDate = this.interval.floor(new Date());
	}

	timeBucketToInterval(timeBucket: CandleTimeBucket) {
		const [durationStr, timeUnit] = timeBucket.split(/(?=[mhd])/) as [`${number}`, TimeUnit];
		const timeUnitInterval = timeUnitIntervals[timeUnit];
		const duration = Number(durationStr);
		return timeUnitInterval.every(duration)!;
	}

	get loadingInitialData() {
		return this.loading && this.data.length === 0;
	}

	get hasData() {
		return this.hasMoreData || this.data.length > 0;
	}

	async fetchData(ticks = 400) {
		if (!this.hasMoreData || this.loading) return;
		this.loading = true;

		const startDate = this.interval.offset(this.endDate, -(ticks - 1));

		const data = await fetchPublicApi(this.fetch, this.endpoint, {
			...this.urlParams,
			time_bucket: this.timeBucket,
			start: startDate.toISOString().slice(0, 19),
			end: this.endDate.toISOString().slice(0, 19)
		});

		const candles = this.transformApiData(data);

		if (candles.length) {
			this.data = [...candles, ...this.data];
			this.endDate = this.interval.offset(startDate, -1);
		} else {
			this.hasMoreData = false;
		}

		this.loading = false;
	}
}
