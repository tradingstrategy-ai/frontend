import type { TimeBucket } from '$lib/schemas/utility';

type CoinbaseProductId = 'BTC-USD' | 'ETH-USD';
type CoinbaseCandle = [time: number, low: number, high: number, open: number, close: number, volume: number];

const COINBASE_API_URL = 'https://api.exchange.coinbase.com';
const MAX_CANDLES_PER_REQUEST = 300;
const benchmarkRequestCache = new Map<string, Promise<[number, number][]>>();

function getGranularitySeconds(timeBucket: TimeBucket) {
	return timeBucket === '1d' ? 86_400 : 3_600;
}

/**
 * Fetch Coinbase close prices for a benchmark product across the requested chart range.
 *
 * Coinbase limits candle responses to 300 rows per request, so we fetch the range
 * in chunks and merge the close-price samples into a single ascending series.
 */
export function fetchCoinbaseBenchmarkCloses(
	fetch: Fetch,
	productId: CoinbaseProductId,
	timeBucket: TimeBucket,
	start: Date,
	end: Date
): Promise<[number, number][]> {
	const granularitySeconds = getGranularitySeconds(timeBucket);
	const cacheKey = `${productId}:${granularitySeconds}:${start.toISOString()}:${end.toISOString()}`;

	const cachedResponse = benchmarkRequestCache.get(cacheKey);
	if (cachedResponse) return cachedResponse;

	const responsePromise = fetchCoinbaseBenchmarkClosesUncached(fetch, productId, granularitySeconds, start, end).catch(
		(error) => {
			benchmarkRequestCache.delete(cacheKey);
			throw error;
		}
	);

	benchmarkRequestCache.set(cacheKey, responsePromise);
	return responsePromise;
}

async function fetchCoinbaseBenchmarkClosesUncached(
	fetch: Fetch,
	productId: CoinbaseProductId,
	granularitySeconds: number,
	start: Date,
	end: Date
): Promise<[number, number][]> {
	const endExclusive = new Date(end.getTime() + granularitySeconds * 1000);
	const chunkSpanMs = granularitySeconds * MAX_CANDLES_PER_REQUEST * 1000;
	const candlesByTimestamp = new Map<number, number>();

	for (let chunkStartMs = start.getTime(); chunkStartMs < endExclusive.getTime(); chunkStartMs += chunkSpanMs) {
		const chunkEndMs = Math.min(chunkStartMs + chunkSpanMs, endExclusive.getTime());
		const searchParams = new URLSearchParams({
			granularity: String(granularitySeconds),
			start: new Date(chunkStartMs).toISOString(),
			end: new Date(chunkEndMs).toISOString()
		});

		const response = await fetch(`${COINBASE_API_URL}/products/${productId}/candles?${searchParams}`);
		if (!response.ok) {
			throw new Error(`Failed to load Coinbase benchmark data for ${productId}: ${response.status}`);
		}

		const candles = (await response.json()) as CoinbaseCandle[];
		for (const [timestamp, , , , close] of candles) {
			if (timestamp >= start.getTime() / 1000 && timestamp <= end.getTime() / 1000) {
				candlesByTimestamp.set(timestamp, close);
			}
		}
	}

	return Array.from(candlesByTimestamp.entries()).sort(([leftTs], [rightTs]) => leftTs - rightTs);
}
