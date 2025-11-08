import type { TimeInterval } from 'd3-time';
import type { TimeBucket } from '$lib/schemas/utility';
import type { ApiCandle, CandleDataItem, DataFeed } from './types';
import { timeBucketToInterval } from './helpers';
import { isHttpError } from '@sveltejs/kit';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { parseDate } from '$lib/helpers/date';
import { dateToTs } from './helpers';

export function tsToUnixTimestamp(ts: string) {
	return dateToTs(parseDate(ts)!);
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

export type ApiDataTransformer = (data: unknown) => CandleDataItem[];

export class CandleDataFeed implements DataFeed<CandleDataItem> {
	interval: TimeInterval;
	endDate: Date;
	loading = $state(false);
	hasMoreData = $state(true);
	data = $state([]) as CandleDataItem[];

	constructor(
		readonly fetch: Fetch,
		readonly endpoint: string,
		readonly timeBucket: TimeBucket,
		readonly urlParams: Record<string, string> = {},
		readonly transformApiData: ApiDataTransformer
	) {
		this.interval = timeBucketToInterval(timeBucket);
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		this.endDate = this.interval.floor(new Date());
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

		let candles: CandleDataItem[] = [];

		try {
			const data = await fetchPublicApi(this.fetch, this.endpoint, {
				...this.urlParams,
				time_bucket: this.timeBucket,
				start: startDate.toISOString().slice(0, 19),
				end: this.endDate.toISOString().slice(0, 19)
			});
			candles = this.transformApiData(data);
		} catch (e) {
			// Swallow 404 returned by reserve candles API when date range returns no data
			if (!(isHttpError(e) && e.status === 404)) throw e;
		}

		if (candles.length) {
			this.data = [...candles, ...this.data];
			this.endDate = this.interval.offset(startDate, -1);
		} else {
			this.hasMoreData = false;
		}

		this.loading = false;
	}
}
