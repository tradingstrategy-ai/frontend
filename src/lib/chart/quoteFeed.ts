/**
 * ChartIQ quote feed adapter for Trading Strategy candle and liquidity data.
 * See: https://documentation.chartiq.com/tutorial-DataIntegrationQuoteFeeds.html
 */
import { backendUrl } from '$lib/config';
import { feedParamsToTimeBucket } from '$lib/chart/timeBucketConverters';

const endpoints = {
  price: 'candles',
  liquidity: 'xyliquidity'
};

function dateUrlParam(date: Date): string {
  return date.toISOString().slice(0,19);
}

function fieldMapper({ ts, o, h, l, c, v, ...restParams }) {
  return {
    Date: ts,
    Open: o,
    High: h,
    Low: l,
    Close: c,
    Volume: v,
    ...restParams
  };
}

async function fetchData(url, symbol, startDate, endDate, params) {
  const urlParams = new URLSearchParams({
    pair_id: symbol,
    time_bucket: feedParamsToTimeBucket(params.period, params.interval),
    start: dateUrlParam(startDate),
    end: dateUrlParam(endDate)
  });

  const response = await fetch(`${url}?${urlParams}`);
  const quotes = await response.json();

  return quotes.map(fieldMapper);
}

export default function(type: 'price' | 'liquidity') {
  const url = `${backendUrl}/${endpoints[type]}`;

  async function fetchInitialData(symbol, startDate, endDate, params, callback) {
    const quotes = await fetchData(url, symbol, startDate, endDate, params);
    callback({ quotes });
  }

  async function fetchPaginationData(symbol, startDate, endDate, params, callback) {
    const quotes = await fetchData(url, symbol, startDate, endDate, params);
    const moreAvailable = quotes.length > 0;
    callback({ quotes, moreAvailable });
  }

  return { fetchInitialData, fetchPaginationData };
}
