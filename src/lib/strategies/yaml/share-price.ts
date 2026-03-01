/**
 * Fetch vault share price data and convert to 90-day relative returns
 * for use in strategy tile chart thumbnails.
 */
import swrCache from '$lib/swrCache';

const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60;

/**
 * Fetch share price data for a vault and convert to 90-day relative returns.
 * Returns [timestamp, relativeReturn][] suitable for share_price_returns_90_days.
 */
async function fetchSharePriceReturns90d(fetch: Fetch, vaultId: string): Promise<[number, number][] | undefined> {
	try {
		const resp = await fetch(`/trading-view/vaults/${vaultId}/metrics`);
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

		return clipped.map(([ts, price]) => [ts, (price - firstPrice) / firstPrice]);
	} catch {
		return undefined;
	}
}

export const getCachedSharePriceReturns = swrCache(fetchSharePriceReturns90d, 3600);
