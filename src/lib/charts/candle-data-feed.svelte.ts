import type { CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { parseDate } from '$lib/helpers/date';
import { utcDay } from 'd3-time';
import { fetchPublicApi } from '$lib/helpers/public-api';

export type ApiCandle = {
	ts: string;
	o: number;
	h: number;
	l: number;
	c: number;
	v?: number;
};

type ChartCandle = CandlestickData<UTCTimestamp>;

function tsToUnixTimestamp(ts: string) {
	return (new Date(`${ts}Z`).valueOf() / 1000) as UTCTimestamp;
}

export class CandleDataFeed {
	loading = $state(false);
	data = $state([]) as ChartCandle[];

	constructor(
		public fetch: Fetch,
		public endpoint: string,
		public urlParams: Record<string, string> = {}
	) {}

	async fetchData(ticks = 200) {
		if (this.loading) return;
		this.loading = true;

		const lastDate = parseDate(this.data[0]?.time);
		const endDate = lastDate ? utcDay.offset(lastDate, -1) : utcDay.floor(new Date());
		const startDate = utcDay.offset(endDate, -ticks);

		const candleData = (await fetchPublicApi(this.fetch, this.endpoint, {
			...this.urlParams,
			time_bucket: '1d',
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
