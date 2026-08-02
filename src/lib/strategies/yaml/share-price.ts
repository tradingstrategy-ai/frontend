/**
 * Fetch vault share price data and convert to 90-day relative returns
 * for use in strategy tile chart thumbnails.
 */
import swrCache from '$lib/swrCache';
import { resampleTimeSeries } from '$lib/charts/helpers';
import { utcDay } from 'd3-time';
import type { PerformanceData } from 'trade-executor/schemas/utility-types';

const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60;

/**
 * Reduce a price-return series to the daily resolution used by strategy tile charts.
 *
 * The metrics endpoint exposes hourly (and sometimes more frequent) samples, while
 * the tile renderer already displays one value per UTC day. Compacting before the
 * page data is serialised avoids sending thousands of samples that cannot affect
 * the rendered chart.
 *
 * @param returns Relative price returns as timestamp/value pairs
 * @returns The latest return for each UTC day, with an initial carry-in sample
 */
export function downsampleSharePriceReturns(returns: PerformanceData): PerformanceData {
	return resampleTimeSeries(returns, utcDay).map(({ time, value }) => [time, value]);
}

/**
 * Fetch share price data for a vault and convert to 90-day relative returns.
 * Returns [timestamp, relativeReturn][] suitable for share_price_returns_90_days.
 */
async function fetchSharePriceReturns90d(fetch: Fetch, vaultId: string): Promise<[number, number][] | undefined> {
	try {
		const resp = await fetch(`/vaults/${vaultId}/metrics`);
		if (!resp.ok) return undefined;

		const data: { price: [number, number][] } = await resp.json();
		if (!data.price?.length) return undefined;

		// Clip to last 90 days
		const cutoff = data.price.at(-1)![0] - NINETY_DAYS_SECONDS;
		const clipped = data.price.filter(([ts]) => ts >= cutoff);
		if (clipped.length < 2) return undefined;

		// Convert to relative returns (0 = break-even at start of period)
		const firstPrice = clipped[0][1];
		if (firstPrice === 0) return undefined;

		const returns = clipped.map(([ts, price]) => [ts, (price - firstPrice) / firstPrice] as [number, number]);

		return downsampleSharePriceReturns(returns);
	} catch {
		return undefined;
	}
}

export const getCachedSharePriceReturns = swrCache(fetchSharePriceReturns90d, 3600);
