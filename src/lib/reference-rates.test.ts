import { describe, test, expect } from 'vitest';

const TIMEOUT = 30_000;
const DELAY_BETWEEN_REQUESTS = 2_000;

/**
 * Integration tests for reference rate fetchers.
 * These hit real endpoints — requires network access.
 * FRED rate-limits requests from CI (GitHub Actions IPs),
 * so we add delays between requests and retry on failure.
 */

// --- FRED CSV export ---

const FRED_CSV_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';

// FRED drops connections without a User-Agent header (Node.js fetch sends none).
// Chrome-style UAs are blocked (TLS fingerprint mismatch); Firefox UAs work.
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchFredCsvLatest(seriesId: string): Promise<number | null> {
	try {
		const resp = await fetch(`${FRED_CSV_BASE}?id=${encodeURIComponent(seriesId)}`, {
			signal: AbortSignal.timeout(TIMEOUT),
			headers: { 'User-Agent': USER_AGENT }
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

describe('fetchFredCsvLatest', () => {
	test(
		'should fetch SNDR (national savings rate) and return a number',
		async () => {
			const value = await fetchFredCsvLatest('SNDR');
			expect(value).not.toBeNull();
			expect(typeof value).toBe('number');
			expect(value).toBeGreaterThan(0);
			expect(value).toBeLessThan(15);
		},
		{ timeout: 45_000, retry: 2 }
	);

	test(
		'should return null for an invalid series ID',
		async () => {
			await sleep(DELAY_BETWEEN_REQUESTS);
			const value = await fetchFredCsvLatest('INVALID_SERIES_XXXXXXXXX');
			expect(value).toBeNull();
		},
		{ timeout: 45_000 }
	);

	test(
		'should fetch DGS10 (10-year Treasury rate) and return a number',
		async () => {
			await sleep(DELAY_BETWEEN_REQUESTS);
			const value = await fetchFredCsvLatest('DGS10');
			expect(value).not.toBeNull();
			expect(typeof value).toBe('number');
			expect(value).toBeGreaterThan(0);
			expect(value).toBeLessThan(20);
		},
		{ timeout: 45_000 }
	);
});

// --- US Treasury Fiscal Data API ---

const TREASURY_RATES_URL =
	'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page%5Bsize%5D=1&filter=security_desc:eq:Treasury%20Notes';

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

describe('fetchTreasuryNoteRate', () => {
	test(
		'should fetch Treasury note rate and return a number',
		async () => {
			const value = await fetchTreasuryNoteRate();
			expect(value).not.toBeNull();
			expect(typeof value).toBe('number');
			// Treasury note rate is typically between 0 and 10 (percent)
			expect(value).toBeGreaterThan(0);
			expect(value).toBeLessThan(10);
		},
		{ timeout: 45_000 }
	);
});
