type CoinbaseProductId = 'BTC-USD' | 'ETH-USD';
type CoinbaseCandle = [time: number, low: number, high: number, open: number, close: number, volume: number];

const COINBASE_API_URL = 'https://api.exchange.coinbase.com';
const MAX_CANDLES_PER_REQUEST = 300;
const MIN_BENCHMARK_POINTS = 100;
const COINBASE_GRANULARITIES_SECONDS = [60, 300, 900, 3_600, 21_600, 86_400] as const;
const benchmarkRequestCache = new Map<string, Promise<[number, number][]>>();

export function getCoinbaseGranularitySeconds(start: Date, end: Date) {
	const durationSeconds = Math.max(0, (end.getTime() - start.getTime()) / 1000);

	for (const granularitySeconds of [...COINBASE_GRANULARITIES_SECONDS].reverse()) {
		const estimatedPointCount = Math.floor(durationSeconds / granularitySeconds) + 1;
		if (estimatedPointCount >= MIN_BENCHMARK_POINTS) {
			return granularitySeconds;
		}
	}

	return COINBASE_GRANULARITIES_SECONDS[0];
}

/**
 * Fetch Coinbase close prices for a benchmark product across the requested chart range.
 *
 * Coinbase limits candle responses to 300 rows per request. We choose the coarsest
 * Coinbase-supported granularity that still gives about 100 samples across the
 * full chart width, then fetch the range in chunks and merge the close prices into
 * a single ascending series.
 */
export function fetchCoinbaseBenchmarkCloses(
	fetch: Fetch,
	productId: CoinbaseProductId,
	start: Date,
	end: Date
): Promise<[number, number][]> {
	const granularitySeconds = getCoinbaseGranularitySeconds(start, end);
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
	const granularityMs = granularitySeconds * 1000;
	const maxChunkSpanMs = granularityMs * (MAX_CANDLES_PER_REQUEST - 1);
	const candlesByTimestamp = new Map<number, number>();

	for (
		let chunkStartMs = start.getTime();
		chunkStartMs <= end.getTime();
		chunkStartMs += maxChunkSpanMs + granularityMs
	) {
		const chunkEndMs = Math.min(chunkStartMs + maxChunkSpanMs, end.getTime());
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
