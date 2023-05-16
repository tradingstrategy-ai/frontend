/**
 * ChartIQ quote feed adapter for Trading Strategy candle and liquidity data.
 * See: https://documentation.chartiq.com/tutorial-DataIntegrationQuoteFeeds.html
 */
import { backendUrl, chartWickThreshold } from '$lib/config';
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
}

export default function quoteFeed(type: 'price' | 'liquidity') {
	const baseUrl = `${backendUrl}/${endpoints[type]}`;
	const lastRequest = {
		price: '',
		liquidity: ''
	};

	async function fetchData(symbol, startDate, endDate, params) {
		const urlParams = new URLSearchParams({
			pair_id: symbol,
			exchange_type: params.stx.exchangeType,
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
