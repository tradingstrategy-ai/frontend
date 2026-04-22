/**
 * Shared helpers for fetching FRED (Federal Reserve Economic Data) series.
 *
 * Provides User-Agent rotation (FRED blocks bare Node.js fetches),
 * file-based caching with stale-fallback, and strict date validation.
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const FRED_CSV_BASE = 'https://fred.stlouisfed.org/graph/fredgraph.csv';
export const FRED_TIMEOUT = 20_000;
export const ONE_DAY_S = 24 * 60 * 60;
export const ONE_DAY_MS = ONE_DAY_S * 1000;

const DEFAULT_CACHE_DIR = join(homedir(), '.cache', 'ts-frontend');

// FRED drops connections without a User-Agent header (Node.js fetch sends none by default).
// Chrome-style UAs are blocked (TLS fingerprint mismatch), so use Firefox/simple UAs.
const USER_AGENTS = [
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
	'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0'
];

export function randomUserAgent(): string {
	return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// --- Date validation ---

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate a YYYY-MM-DD string strictly: regex + round-trip check.
 * Rejects impossible dates like 2026-02-31.
 */
export function isValidDateString(value: string): boolean {
	if (!DATE_RE.test(value)) return false;
	const d = new Date(value + 'T00:00:00Z');
	if (isNaN(d.getTime())) return false;
	// Round-trip: format back and compare
	const [y, m, day] = value.split('-').map(Number);
	return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m && d.getUTCDate() === day;
}

/** Format a Date as YYYY-MM-DD in UTC. */
export function formatDateYMD(d: Date): string {
	return d.toISOString().slice(0, 10);
}

// --- File cache helpers ---

export async function readJsonFileCache<T>(key: string, cacheDir = DEFAULT_CACHE_DIR): Promise<T | null> {
	try {
		const data = await readFile(join(cacheDir, `${key}.json`), 'utf-8');
		return JSON.parse(data) as T;
	} catch {
		return null;
	}
}

export async function writeJsonFileCache<T>(key: string, value: T, cacheDir = DEFAULT_CACHE_DIR): Promise<void> {
	try {
		await mkdir(cacheDir, { recursive: true });
		await writeFile(join(cacheDir, `${key}.json`), JSON.stringify(value));
	} catch {
		// ignore write errors
	}
}

/** Check if a cache file exists and was written within the given TTL (in seconds). */
export async function isCacheFresh(key: string, ttlSeconds: number, cacheDir = DEFAULT_CACHE_DIR): Promise<boolean> {
	try {
		const s = await stat(join(cacheDir, `${key}.json`));
		return Date.now() - s.mtimeMs < ttlSeconds * 1000;
	} catch {
		return false;
	}
}
