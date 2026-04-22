/**
 * Client-side fetcher for FRED DTB3 (3-month Treasury bill) time series,
 * and cumulative return conversion for chart overlay.
 */
import type { TimeInterval } from 'd3-time';
import type { UTCTimestamp } from 'lightweight-charts';
import type { SimpleDataItem } from '$lib/charts/types';
/** Format a Date as YYYY-MM-DD in UTC. */
function formatDateYMD(d: Date): string {
	return d.toISOString().slice(0, 10);
}

type RateEntry = [timestamp: number, rate: number];

export type TreasuryDataItem = SimpleDataItem & {
	customValues: { percentChange: number; annualRate: number; rateDate: number };
};

const SEED_DAYS = 7;
const YEAR_MS = 365.25 * 86_400 * 1000;

const benchmarkRequestCache = new Map<string, Promise<RateEntry[]>>();

/**
 * Fetch DTB3 time series from the server-side proxy endpoint.
 *
 * Expands the start date backwards by 7 days to seed forward-fill,
 * so we have a rate observation even if the visible start falls on a weekend.
 */
export function fetchTreasuryBenchmarkSeries(fetch: Fetch, start: Date, end: Date): Promise<RateEntry[]> {
	const seedStart = new Date(start.getTime() - SEED_DAYS * 86_400 * 1000);
	const cosd = formatDateYMD(seedStart);
	const coed = formatDateYMD(end);
	const cacheKey = `${cosd}:${coed}`;

	const cached = benchmarkRequestCache.get(cacheKey);
	if (cached) return cached;

	const params = new URLSearchParams({ cosd, coed });
	const promise = fetch(`/trading-view/vaults/treasury-benchmark?${params}`)
		.then((resp) => {
			if (!resp.ok) throw new Error(`Treasury benchmark fetch failed: ${resp.status}`);
			return resp.json() as Promise<RateEntry[]>;
		})
		.catch((error) => {
			benchmarkRequestCache.delete(cacheKey);
			throw error;
		});

	benchmarkRequestCache.set(cacheKey, promise);
	return promise;
}

/**
 * Convert FRED daily annual yield rates into a cumulative return price line.
 *
 * Does NOT use resampleTimeSeries — that would discard customValues metadata.
 * Instead generates interval-aligned points directly, compounding based on
 * actual elapsed time to handle any interval (4h, 1d, etc.) correctly.
 *
 * @param rates - Raw FRED data: [unixTimestamp, annualRatePercent][]
 * @param startingValue - Vault share price at the start (the baseline)
 * @param interval - d3 time interval for output points (e.g. utcHour.every(4) for 1M)
 * @param startDate - Visible range start (cumulative compounding starts here)
 * @param endDate - Visible range end
 */
export function ratesToCumulativeReturn(
	rates: RateEntry[],
	startingValue: number,
	interval: TimeInterval,
	startDate: Date,
	endDate: Date
): TreasuryDataItem[] {
	if (rates.length === 0 || startingValue <= 0) return [];

	// Build sorted rate lookup: [{dateMs, rate}]
	const sortedRates = rates.map(([ts, rate]) => ({ dateMs: ts * 1000, rate })).sort((a, b) => a.dateMs - b.dateMs);

	const results: TreasuryDataItem[] = [];
	let currentRateIndex = 0;
	let currentRate = sortedRates[0].rate;
	let currentRateDateMs = sortedRates[0].dateMs;
	let cumulativeValue = startingValue;
	let prevDateMs = startDate.getTime();
	const startMs = startDate.getTime();

	// Advance rate index to the last observation at or before startDate
	while (currentRateIndex < sortedRates.length - 1 && sortedRates[currentRateIndex + 1].dateMs <= startMs) {
		const nextRate = sortedRates[++currentRateIndex];
		currentRate = nextRate.rate;
		currentRateDateMs = nextRate.dateMs;
	}

	// Generate points at each interval step
	let current = interval.floor(startDate);
	const lastDate = interval.floor(endDate);

	while (current <= lastDate) {
		const currentMs = current.getTime();

		// Skip floored points before the actual start
		if (currentMs < startMs) {
			current = interval.offset(current);
			continue;
		}

		// Forward-fill: advance to the last rate observation at or before this point
		while (currentRateIndex < sortedRates.length - 1 && sortedRates[currentRateIndex + 1].dateMs <= currentMs) {
			const nextRate = sortedRates[++currentRateIndex];
			currentRate = nextRate.rate;
			currentRateDateMs = nextRate.dateMs;
		}

		// Compound based on actual elapsed time
		const elapsedMs = currentMs - prevDateMs;
		if (elapsedMs > 0) {
			const growthFactor = (1 + currentRate / 100) ** (elapsedMs / YEAR_MS);
			cumulativeValue *= growthFactor;
		}

		const percentChange = cumulativeValue / startingValue - 1;

		results.push({
			time: (currentMs / 1000) as UTCTimestamp,
			value: cumulativeValue,
			customValues: { percentChange, annualRate: currentRate, rateDate: currentRateDateMs / 1000 }
		});

		prevDateMs = currentMs;
		current = interval.offset(current);
	}

	return results;
}
