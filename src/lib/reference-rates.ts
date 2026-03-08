/**
 * Server-side reference rate fetchers with SWR caching.
 *
 * - FRED CSV export (no API key): savings rate (SNDR)
 * - US Treasury Fiscal Data API (no API key): Treasury note rate
 *
 * Both use graceful failure (return null) and 20-second timeouts.
 */
import swrCache from '$lib/swrCache';

const TIMEOUT = 20_000;
const ONE_DAY = 24 * 60 * 60;
const ONE_WEEK = 7 * ONE_DAY;

// --- FRED CSV export ---

const FRED_CSV_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';

/**
 * Fetch the latest value of a FRED series from the CSV export.
 *
 * @param seriesId - FRED series identifier (e.g. 'SNDR' for national savings rate)
 * @returns Latest observation value, or null on any error
 */
async function fetchFredCsvLatest(seriesId: string): Promise<number | null> {
	try {
		const resp = await fetch(`${FRED_CSV_BASE}?id=${encodeURIComponent(seriesId)}`, {
			signal: AbortSignal.timeout(TIMEOUT)
		});
		if (!resp.ok) return null;
		const text = await resp.text();
		const lines = text.trim().split('\n');
		const lastLine = lines[lines.length - 1];
		const value = parseFloat(lastLine.split(',')[1]);
		return Number.isFinite(value) ? value : null;
	} catch {
		return null;
	}
}

export const fetchLatestFredValue = swrCache(fetchFredCsvLatest, ONE_WEEK);

// --- US Treasury Fiscal Data API ---

const TREASURY_RATES_URL =
	'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=1&filter=security_desc:eq:Treasury Notes';

/**
 * Fetch the latest US Treasury note average interest rate.
 *
 * @returns Latest rate as a percentage, or null on any error
 */
async function fetchTreasuryNoteRate(): Promise<number | null> {
	try {
		const resp = await fetch(TREASURY_RATES_URL, {
			signal: AbortSignal.timeout(TIMEOUT)
		});
		if (!resp.ok) return null;
		const json = await resp.json();
		const rate = parseFloat(json.data?.[0]?.avg_interest_rate_amt);
		return Number.isFinite(rate) ? rate : null;
	} catch {
		return null;
	}
}

export const fetchLatestTreasuryRate = swrCache(fetchTreasuryNoteRate, ONE_DAY);
