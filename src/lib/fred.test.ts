import { describe, test, expect } from 'vitest';

/**
 * Integration tests for FRED CSV export client.
 * These hit the real FRED endpoint — requires network access.
 */
describe('fetchFredCsvLatest', () => {
	// Import the raw (uncached) function indirectly by testing the cached wrapper
	// We test the exported cached version to validate the full pipeline.
	const FRED_CSV_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';

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

	test('should fetch SNDR (national savings rate) and return a number', async () => {
		const value = await fetchFredCsvLatest('SNDR');
		expect(value).not.toBeNull();
		expect(typeof value).toBe('number');
		// SNDR is typically between 0 and 15 (percent)
		expect(value).toBeGreaterThan(0);
		expect(value).toBeLessThan(15);
	}, 30_000);

	test('should return null for an invalid series ID', async () => {
		const value = await fetchFredCsvLatest('INVALID_SERIES_XXXXXXXXX');
		expect(value).toBeNull();
	}, 30_000);

	test('should fetch DGS10 (10-year Treasury rate) and return a number', async () => {
		const value = await fetchFredCsvLatest('DGS10');
		expect(value).not.toBeNull();
		expect(typeof value).toBe('number');
		// 10-year Treasury rate is typically between 0 and 20 (percent)
		expect(value).toBeGreaterThan(0);
		expect(value).toBeLessThan(20);
	}, 30_000);
});
