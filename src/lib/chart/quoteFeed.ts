/**
 * ChartIQ quote feed adapter for Trading Strategy candle and liquidity data.
 * See: https://documentation.chartiq.com/tutorial-DataIntegrationQuoteFeeds.html
 */
import { backendUrl } from '$lib/config';
import { periodicityToTimeBucket } from '$lib/chart/timeBucketConverters';

const maxTicks = 2000;

const endpoints = {
	price: 'candles',
	liquidity: 'xyliquidity'
};

function dateUrlParam(date: Date): string {
	return date.toISOString().slice(0, 19);
}

function fieldMapper({ ts, o, h, l, c, v, ...restParams }) {
	return {
		DT: `${ts}Z`,
		Open: o,
		High: h,
		Low: l,
		Close: c,
		Volume: v,
		...restParams
	};
}

export default function quoteFeed(type: 'price' | 'liquidity') {
	const baseUrl = `${backendUrl}/${endpoints[type]}`;
	const lastRequest = {
		price: null,
		liquidity: null
	};

	async function fetchData(symbol, startDate, endDate, params) {
		const urlParams = new URLSearchParams({
			pair_id: symbol,
			time_bucket: periodicityToTimeBucket(params.stx.getPeriodicity()),
			start: dateUrlParam(startDate),
			end: dateUrlParam(endDate)
		});

		const queryString = `?${urlParams}`;

		// Prevent infinite request loops: if request is identical to last request,
		// instruct ChartIQ to check for older data. See:
		// https://documentation.chartiq.com/tutorial-DataIntegrationQuoteFeeds.html#toc6__anchor
		if (lastRequest[type] === queryString) {
			return [{ DT: startDate - (endDate - startDate) }];
		}

		lastRequest[type] = queryString;
		const response = await fetch(baseUrl + queryString);
		const quotes = await response.json();

		return quotes.map(fieldMapper);
	}

	async function fetchInitialData(symbol, startDate, endDate, params, callback) {
		const quotes = await fetchData(symbol, startDate, endDate, params);
		callback({ quotes });
	}

	async function fetchPaginationData(symbol, startDate, endDate, params, callback) {
		const quotes = await fetchData(symbol, startDate, endDate, params);
		const moreAvailable = dateUrlParam(startDate) > params.stx.firstTradeDate;
		callback({ quotes, moreAvailable });
	}

	return { fetchInitialData, fetchPaginationData, maxTicks };
}
