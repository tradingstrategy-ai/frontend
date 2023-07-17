/**
 * ChartIQ quote feed adapter for Trading Strategy candle and liquidity data.
 * See: https://documentation.chartiq.com/tutorial-DataIntegrationQuoteFeeds.html
 */
import equal from 'fast-deep-equal';
import { chartWickThreshold } from '$lib/config';
import { fetchPublicApi } from '$lib/helpers/public-api';

export type Candle = {
	o: number;
	h: number;
	l: number;
	c: number;
	v?: number;
	[key: string]: any;
};

export type Quote = {
	Open: number;
	High: number;
	Low: number;
	Close: number;
	ClippedHigh?: number;
	ClippedLow?: number;
	Volume?: number;
	[key: string]: any;
};

export type DataToQuotes = (data: any) => Quote[];

export type QuoteFeed = ReturnType<typeof quoteFeed>;

const maxTicks = 2000;

function dateUrlParam(date: Date): string {
	return date.toISOString().slice(0, 19);
}

// Maps a single Trading Strategy candle to ChartIQ quote, with clipped
// High/Low values appended
export function candleToQuote({ ts, o, h, l, c, v, ...restParams }: Candle): Quote {
	const quote: Quote = {
		DT: `${ts}Z`,
		Open: o,
		High: h,
		Low: l,
		Close: c
	};

	if (v !== undefined) quote.Volume = v;

	return {
		...quote,
		...clippedValues({ o, h, l, c }),
		...restParams
	};
}

// Prevent long candle wicks from exploding the yAxis scale.
// see: ChartIQ#chartIQ action initialization
// see: https://documentation.chartiq.com/CIQ.ChartEngine.html#determineMinMax
function clippedValues({ o, h, l, c }: Candle) {
	if (![o, h, l, c].every(Number.isFinite)) return {};
	return {
		ClippedLow: Math.max(l, Math.min(o, c) * (1 - chartWickThreshold)),
		ClippedHigh: Math.min(h, Math.max(o, c) * (1 + chartWickThreshold))
	};
}

// Default response data mapper - maps array of Trading Strategy candles to ChartIQ quotes
function candlesToQuotes(candles: Candle[]) {
	return candles.map(candleToQuote);
}

// Determine if more data is available based on firstQuoteDate (if available)
function hasMoreAvailable(startDate: Date, firstQuoteDate: MaybeDate) {
	return firstQuoteDate ? startDate > firstQuoteDate : true;
}

export function quoteFeed(endpoint: string, responseDataToQuotes: DataToQuotes = candlesToQuotes) {
	let lastRequest = {};

	async function fetchData(_: string, startDate: Date, endDate: Date, params: any, callback: Function) {
		const { symbolObject } = params.stx.chart;

		const urlParams = {
			...symbolObject.urlParams,
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

		const data = await fetchPublicApi(fetch, endpoint, urlParams);

		callback({
			quotes: responseDataToQuotes(data),
			moreAvailable: hasMoreAvailable(startDate, symbolObject.firstQuoteDate)
		});
	}

	return {
		fetchInitialData: fetchData,
		fetchPaginationData: fetchData,
		maxTicks
	};
}
