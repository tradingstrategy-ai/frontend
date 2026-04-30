/**
 * Server-side reference rate fetchers with SWR caching and file-based fallback.
 *
 * - FRED CSV export (no API key): savings rate (SNDR)
 * - US Treasury Fiscal Data API (no API key): Treasury note rate
 *
 * Both use graceful failure with a two-tier cache:
 * 1. In-memory SWR cache for fast repeated access
 * 2. File cache (~/.cache/ts-frontend/) so a valid rate survives server
 *    restarts and transient API failures (e.g. FRED rate-limiting)
 */
import swrCache from '$lib/swrCache';
import {
	FRED_CSV_BASE,
	FRED_TIMEOUT,
	ONE_DAY_S,
	randomUserAgent,
	readJsonFileCache,
	writeJsonFileCache
} from '$lib/fred-helpers';

const TWO_DAYS = 2 * ONE_DAY_S;

// --- FRED CSV export ---

/**
 * Fetch the latest value of a FRED series from the CSV export.
 * Falls back to file cache if the API request fails.
 *
 * @param seriesId - FRED series identifier (e.g. 'SNDR' for national savings rate)
 * @returns Latest observation value, or null if both API and file cache miss
 */
async function fetchFredCsvLatest(seriesId: string): Promise<number | null> {
	const cacheKey = `fred-${seriesId}`;
	try {
		const resp = await fetch(`${FRED_CSV_BASE}?id=${encodeURIComponent(seriesId)}`, {
			signal: AbortSignal.timeout(FRED_TIMEOUT),
			headers: { 'User-Agent': randomUserAgent() }
		});
		if (!resp.ok) return readJsonFileCache<number>(cacheKey);
		const text = await resp.text();
		const lines = text.trim().split('\n');
		const lastLine = lines[lines.length - 1];
		const value = parseFloat(lastLine.split(',')[1]);
		if (Number.isFinite(value)) {
			await writeJsonFileCache(cacheKey, value);
			return value;
		}
		return readJsonFileCache<number>(cacheKey);
	} catch {
		return readJsonFileCache<number>(cacheKey);
	}
}

export const fetchLatestFredValue = swrCache(fetchFredCsvLatest, TWO_DAYS);

// --- US Treasury Fiscal Data API ---

const TREASURY_RATES_URL =
	'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page%5Bsize%5D=1&filter=security_desc:eq:Treasury%20Notes';

/**
 * Fetch the latest US Treasury note average interest rate.
 * Falls back to file cache if the API request fails.
 *
 * @returns Latest rate as a percentage, or null if both API and file cache miss
 */
async function fetchTreasuryNoteRate(): Promise<number | null> {
	const cacheKey = 'treasury-note-rate';
	try {
		const resp = await fetch(TREASURY_RATES_URL, {
			signal: AbortSignal.timeout(FRED_TIMEOUT),
			headers: { 'User-Agent': randomUserAgent() }
		});
		if (!resp.ok) return readJsonFileCache<number>(cacheKey);
		const json = await resp.json();
		const rate = parseFloat(json.data?.[0]?.avg_interest_rate_amt);
		if (Number.isFinite(rate)) {
			await writeJsonFileCache(cacheKey, rate);
			return rate;
		}
		return readJsonFileCache<number>(cacheKey);
	} catch {
		return readJsonFileCache<number>(cacheKey);
	}
}

export const fetchLatestTreasuryRate = swrCache(fetchTreasuryNoteRate, TWO_DAYS);
