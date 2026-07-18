/**
 * Server-side proxy for Coinbase candle data (BTC-USD, ETH-USD).
 *
 * Proxies through the server to avoid CORS issues and Coinbase rate-limiting.
 * Uses file-based caching with stale-fallback on fetch failure.
 */
import { error, json } from '@sveltejs/kit';
import { readJsonFileCache, writeJsonFileCache, isCacheFresh } from '$lib/fred-helpers';

const COINBASE_API_URL = 'https://api.exchange.coinbase.com';
const MAX_CANDLES_PER_REQUEST = 300;
const VALID_PRODUCT_IDS = ['BTC-USD', 'ETH-USD'] as const;
const VALID_GRANULARITIES = [60, 300, 900, 3_600, 21_600, 86_400] as const;
const CACHE_TTL_S = 3_600; // 1 hour
const FETCH_TIMEOUT = 15_000;

type CoinbaseCandle = [time: number, low: number, high: number, open: number, close: number, volume: number];

function isValidISODate(value: string): boolean {
	const d = new Date(value);
	return !isNaN(d.getTime());
}

async function fetchCoinbaseChunk(
	productId: string,
	granularitySeconds: number,
	start: Date,
	end: Date
): Promise<CoinbaseCandle[]> {
	const searchParams = new URLSearchParams({
		granularity: String(granularitySeconds),
		start: start.toISOString(),
		end: end.toISOString()
	});

	const response = await fetch(`${COINBASE_API_URL}/products/${productId}/candles?${searchParams}`, {
		signal: AbortSignal.timeout(FETCH_TIMEOUT)
	});

	if (!response.ok) {
		throw new Error(`Coinbase returned ${response.status}`);
	}

	return (await response.json()) as CoinbaseCandle[];
}

async function fetchAllChunks(
	productId: string,
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
		const candles = await fetchCoinbaseChunk(
			productId,
			granularitySeconds,
			new Date(chunkStartMs),
			new Date(chunkEndMs)
		);

		for (const [timestamp, , , , close] of candles) {
			if (timestamp >= start.getTime() / 1000 && timestamp <= end.getTime() / 1000) {
				candlesByTimestamp.set(timestamp, close);
			}
		}
	}

	return Array.from(candlesByTimestamp.entries()).sort(([a], [b]) => a - b);
}

export async function GET({ url }) {
	const productId = url.searchParams.get('productId');
	const granularity = url.searchParams.get('granularity');
	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');

	if (!productId || !VALID_PRODUCT_IDS.includes(productId as (typeof VALID_PRODUCT_IDS)[number])) {
		error(400, 'Invalid productId — must be BTC-USD or ETH-USD');
	}

	const granularitySeconds = Number(granularity);
	if (!VALID_GRANULARITIES.includes(granularitySeconds as (typeof VALID_GRANULARITIES)[number])) {
		error(400, 'Invalid granularity');
	}

	if (!start || !end || !isValidISODate(start) || !isValidISODate(end)) {
		error(400, 'Invalid start/end — expected ISO 8601 date strings');
	}

	const startDate = new Date(start);
	const endDate = new Date(end);

	if (endDate < startDate) {
		error(400, 'end must be >= start');
	}

	const cacheKey = `coinbase-${productId}-${granularitySeconds}-${startDate.toISOString()}-${endDate.toISOString()}`;

	// Check file cache
	if (await isCacheFresh(cacheKey, CACHE_TTL_S)) {
		const cached = await readJsonFileCache<[number, number][]>(cacheKey);
		if (cached) {
			return json(cached, {
				headers: { 'Cache-Control': 'public, max-age=3600' }
			});
		}
	}

	// Fetch from Coinbase with one retry
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const closes = await fetchAllChunks(productId, granularitySeconds, startDate, endDate);
			await writeJsonFileCache(cacheKey, closes);
			return json(closes, {
				headers: { 'Cache-Control': 'public, max-age=3600' }
			});
		} catch (e) {
			if (attempt === 0) {
				console.warn(`Coinbase fetch attempt 1 failed for ${productId}, retrying:`, e);
				continue;
			}
			console.warn(`Coinbase fetch failed for ${cacheKey}:`, e);
		}
	}

	// Fall back to stale cache
	const stale = await readJsonFileCache<[number, number][]>(cacheKey);
	if (stale) {
		console.warn(`Serving stale Coinbase cache for ${cacheKey}`);
		return json(stale, {
			headers: { 'Cache-Control': 'public, max-age=600' }
		});
	}

	error(502, `Coinbase benchmark unavailable for ${productId}`);
}
