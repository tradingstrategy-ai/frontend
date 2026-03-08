/**
 * FRED (Federal Reserve Economic Data) CSV export client.
 *
 * Fetches series data from FRED's public CSV endpoint (no API key needed).
 * Results are cached server-side for one week using SWR strategy.
 *
 * @see https://fred.stlouisfed.org/docs/api/fred/
 */
import swrCache from '$lib/swrCache';

const FRED_CSV_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';
const ONE_WEEK = 7 * 24 * 60 * 60;

/**
 * Fetch the latest value of a FRED series from the CSV export.
 *
 * @param seriesId - FRED series identifier (e.g. 'SNDR' for national savings rate)
 * @returns Latest observation value, or null on any error
 */
async function fetchFredCsvLatest(seriesId: string): Promise<number | null> {
	try {
		const resp = await fetch(`${FRED_CSV_BASE}?id=${encodeURIComponent(seriesId)}`, {
			signal: AbortSignal.timeout(20_000)
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
