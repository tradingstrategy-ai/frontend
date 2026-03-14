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
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import swrCache from '$lib/swrCache';

const TIMEOUT = 20_000;
const ONE_DAY = 24 * 60 * 60;
const TWO_DAYS = 2 * ONE_DAY;

// FRED drops connections without a User-Agent header (Node.js fetch sends none by default).
// Chrome-style UAs are blocked (TLS fingerprint mismatch), so use Firefox/simple UAs.
const USER_AGENTS = [
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
	'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0'
];

function randomUserAgent(): string {
	return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// --- File cache helpers ---

const CACHE_DIR = join(homedir(), '.cache', 'ts-frontend');

async function readFileCache(key: string): Promise<number | null> {
	try {
		const data = await readFile(join(CACHE_DIR, `${key}.json`), 'utf-8');
		const value = JSON.parse(data);
		return typeof value === 'number' && Number.isFinite(value) ? value : null;
	} catch {
		return null;
	}
}

async function writeFileCache(key: string, value: number): Promise<void> {
	try {
		await mkdir(CACHE_DIR, { recursive: true });
		await writeFile(join(CACHE_DIR, `${key}.json`), JSON.stringify(value));
	} catch {
		// ignore write errors
	}
}

// --- FRED CSV export ---

const FRED_CSV_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';

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
			signal: AbortSignal.timeout(TIMEOUT),
			headers: { 'User-Agent': randomUserAgent() }
		});
		if (!resp.ok) return readFileCache(cacheKey);
		const text = await resp.text();
		const lines = text.trim().split('\n');
		const lastLine = lines[lines.length - 1];
		const value = parseFloat(lastLine.split(',')[1]);
		if (Number.isFinite(value)) {
			await writeFileCache(cacheKey, value);
			return value;
		}
		return readFileCache(cacheKey);
	} catch {
		return readFileCache(cacheKey);
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
			signal: AbortSignal.timeout(TIMEOUT),
			headers: { 'User-Agent': randomUserAgent() }
		});
		if (!resp.ok) return readFileCache(cacheKey);
		const json = await resp.json();
		const rate = parseFloat(json.data?.[0]?.avg_interest_rate_amt);
		if (Number.isFinite(rate)) {
			await writeFileCache(cacheKey, rate);
			return rate;
		}
		return readFileCache(cacheKey);
	} catch {
		return readFileCache(cacheKey);
	}
}

export const fetchLatestTreasuryRate = swrCache(fetchTreasuryNoteRate, TWO_DAYS);
