/**
 * Server-side proxy for FRED DTB3 (3-month Treasury bill) time series.
 *
 * Proxies through the server to avoid CORS issues and FRED rate-limiting.
 * Uses file-based caching with stale-fallback on fetch failure.
 */
import { error, json } from '@sveltejs/kit';
import {
	FRED_CSV_BASE,
	FRED_TIMEOUT,
	ONE_DAY_S,
	formatDateYMD,
	isValidDateString,
	randomUserAgent,
	readJsonFileCache,
	writeJsonFileCache,
	isCacheFresh
} from '$lib/fred-helpers';

const SERIES_ID = 'DTB3';
/** Earliest DTB3 observation on FRED */
const SERIES_START = '1954-01-04';

type RateEntry = [timestamp: number, rate: number];

function todayYMD(): string {
	return formatDateYMD(new Date());
}

/**
 * Validate and clamp date range parameters.
 * Returns clamped [cosd, coed] or throws a 400 error.
 */
function validateAndClampDates(rawCosd: string | null, rawCoed: string | null): [string, string] {
	if (!rawCosd || !rawCoed) {
		error(400, 'Missing required query params: cosd, coed');
	}

	if (!isValidDateString(rawCosd) || !isValidDateString(rawCoed)) {
		error(400, 'Invalid date format — expected YYYY-MM-DD with valid calendar dates');
	}

	const today = todayYMD();

	// Reject future start date
	if (rawCosd > today) {
		error(400, 'cosd must not be in the future');
	}

	// Clamp to DTB3 series bounds
	const cosd = rawCosd < SERIES_START ? SERIES_START : rawCosd;
	const coed = rawCoed > today ? today : rawCoed;

	// Re-validate ordering after clamping
	if (coed < cosd) {
		error(400, 'coed must be >= cosd (after clamping to valid range)');
	}

	return [cosd, coed];
}

function parseFredCsv(text: string): RateEntry[] {
	const lines = text.trim().split('\n');
	const entries: RateEntry[] = [];

	// Skip header row
	for (let i = 1; i < lines.length; i++) {
		const [dateStr, valueStr] = lines[i].split(',');
		// FRED uses "." for missing values (holidays, weekends)
		if (!valueStr || valueStr.trim() === '.') continue;
		const rate = parseFloat(valueStr);
		if (!Number.isFinite(rate)) continue;
		const timestamp = Date.parse(dateStr + 'T00:00:00Z') / 1000;
		if (!Number.isFinite(timestamp)) continue;
		entries.push([timestamp, rate]);
	}

	return entries;
}

export async function GET({ url }) {
	const [cosd, coed] = validateAndClampDates(url.searchParams.get('cosd'), url.searchParams.get('coed'));

	const cacheKey = `fred-${SERIES_ID}-${cosd}-${coed}`;

	// Check file cache
	if (await isCacheFresh(cacheKey, ONE_DAY_S)) {
		const cached = await readJsonFileCache<RateEntry[]>(cacheKey);
		if (cached) {
			return json(cached, {
				headers: { 'Cache-Control': 'public, max-age=86400' }
			});
		}
	}

	// Fetch from FRED
	const params = new URLSearchParams({ id: SERIES_ID, cosd, coed });
	try {
		const resp = await fetch(`${FRED_CSV_BASE}?${params}`, {
			signal: AbortSignal.timeout(FRED_TIMEOUT),
			headers: { 'User-Agent': randomUserAgent() }
		});

		if (!resp.ok) {
			console.warn(`FRED fetch failed (${resp.status}), attempting stale cache for ${cacheKey}`);
			return returnStaleOrError(cacheKey, `FRED returned ${resp.status}`);
		}

		const text = await resp.text();
		const entries = parseFredCsv(text);

		if (entries.length === 0) {
			console.warn(`FRED returned no valid data for ${cacheKey}, attempting stale cache`);
			return returnStaleOrError(cacheKey, 'No valid FRED data');
		}

		// Write cache
		await writeJsonFileCache(cacheKey, entries);

		return json(entries, {
			headers: { 'Cache-Control': 'public, max-age=86400' }
		});
	} catch (e) {
		console.warn(`FRED fetch error for ${cacheKey}:`, e);
		return returnStaleOrError(cacheKey, 'FRED fetch failed');
	}
}

/**
 * Return stale cache data if available, otherwise throw 502.
 */
async function returnStaleOrError(cacheKey: string, reason: string) {
	const stale = await readJsonFileCache<RateEntry[]>(cacheKey);
	if (stale) {
		console.warn(`Serving stale cache for ${cacheKey} (reason: ${reason})`);
		return json(stale, {
			headers: { 'Cache-Control': 'public, max-age=3600' }
		});
	}
	error(502, `Treasury benchmark unavailable: ${reason}`);
}
