/**
 * ChartIQ quote feed adapter for Trading Strategy candle and liquidity data.
 * See: https://documentation.chartiq.com/tutorial-DataIntegrationQuoteFeeds.html
 */
import equal from 'fast-deep-equal';
import { chartWickThreshold } from '$lib/config';
import { fetchPublicApi } from '$lib/helpers/public-api';
import { periodicityToTimeBucket } from '$lib/chart/timeBucketConverters';

const maxTicks = 2000;

function dateUrlParam(date: Date): string {
	return date.toISOString().slice(0, 19);
}

function mapQuotes(quotes: Record<string, any>[]) {
	return quotes.map(({ ts, o, h, l, c, v, ...restParams }) => {
		// Prevent long candle wicks from exploding the yAxis scale.
		// see: ChartIQ#chartIQ action initialization
		// see: https://documentation.chartiq.com/CIQ.ChartEngine.html#determineMinMax
		const wickMin = Math.max(l, Math.min(o, c) * (1 - chartWickThreshold));
		const wickMax = Math.min(h, Math.max(o, c) * (1 + chartWickThreshold));

		return {
			DT: `${ts}Z`,
			Open: o,
			High: h,
			Low: l,
			Close: c,
			Volume: v,
			wickMin,
			wickMax,
			...restParams
		};
	});
}

function hasMoreAvailable(startDate: Date, firstQuoteDate: MaybeDate) {
	return firstQuoteDate ? startDate > firstQuoteDate : true;
}

export default function quoteFeed(endpoint: string) {
	let lastRequest = {};

	async function fetchData(_: string, startDate: Date, endDate: Date, params: any, callback: Function) {
		const { symbolObject } = params.stx.chart;
		const periodicity = params.stx.getPeriodicity();

		const urlParams = {
			...symbolObject.urlParams,
			time_bucket: periodicityToTimeBucket(periodicity),
			start: dateUrlParam(startDate),
			end: dateUrlParam(endDate)
		};

		// Prevent infinite request loops: if request is identical to last request,
		// instruct ChartIQ to check for older data. See:
		// https://documentation.chartiq.com/tutorial-DataIntegrationQuoteFeeds.html#toc6__anchor
		if (equal(urlParams, lastRequest)) {
			const periodLength = +endDate - +startDate;
			return [{ DT: +startDate - periodLength }];
		}
		lastRequest = urlParams;

		const quotes = await fetchPublicApi(fetch, endpoint, urlParams);

		callback({
			quotes: mapQuotes(quotes),
			moreAvailable: hasMoreAvailable(startDate, symbolObject.firstQuoteDate)
		});
	}

	return {
		fetchInitialData: fetchData,
		fetchPaginationData: fetchData,
		maxTicks
	};
}
