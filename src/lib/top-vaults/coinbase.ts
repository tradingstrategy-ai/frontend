type CoinbaseProductId = 'BTC-USD' | 'ETH-USD';

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
 * Fetch Coinbase close prices for a benchmark product via the server-side proxy.
 *
 * The proxy handles chunking, retries, and caching to avoid CORS issues
 * and Coinbase rate-limiting.
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

	const params = new URLSearchParams({
		productId,
		granularity: String(granularitySeconds),
		start: start.toISOString(),
		end: end.toISOString()
	});

	const responsePromise = fetch(`/vaults/coinbase-candles?${params}`)
		.then((resp) => {
			if (!resp.ok) throw new Error(`Coinbase benchmark proxy failed: ${resp.status}`);
			return resp.json() as Promise<[number, number][]>;
		})
		.catch((error) => {
			benchmarkRequestCache.delete(cacheKey);
			throw error;
		});

	benchmarkRequestCache.set(cacheKey, responsePromise);
	return responsePromise;
}
