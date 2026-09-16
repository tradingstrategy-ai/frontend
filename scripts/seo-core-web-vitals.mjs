#!/usr/bin/env node

/**
 * Fetch Core Web Vitals field data for tradingstrategy.ai from the Chrome UX Report (CrUX) API.
 *
 * This is the same data source Google Search Console uses for its Core Web Vitals report
 * (the report itself is not exposed through the Search Console API).
 *
 * Usage:
 *
 *   pnpm run seo:cwv                       # origin-level, phone + desktop
 *   pnpm run seo:cwv --url https://tradingstrategy.ai/trading-view/vaults
 *   pnpm run seo:cwv --history          # last 25 weeks of p75 values (origin or --url)
 *   pnpm run seo:cwv --device phone     # single form factor
 *   pnpm run seo:cwv --json             # raw API response
 *
 * Requires TS_PRIVATE_GOOGLE_CRUX_API_KEY in .env.local (restricted to the
 * Chrome UX Report + PageSpeed Insights APIs); see docs/google-webmasters.md.
 */
import { parseArgs } from 'node:util';

const ORIGIN = 'https://tradingstrategy.ai';
const API = 'https://chromeuxreport.googleapis.com/v1/records';

const METRICS = [
	{ id: 'largest_contentful_paint', label: 'LCP', unit: 'ms', good: 2500, poor: 4000 },
	{ id: 'interaction_to_next_paint', label: 'INP', unit: 'ms', good: 200, poor: 500 },
	{ id: 'cumulative_layout_shift', label: 'CLS', unit: '', good: 0.1, poor: 0.25 },
	{ id: 'first_contentful_paint', label: 'FCP', unit: 'ms', good: 1800, poor: 3000 },
	{ id: 'experimental_time_to_first_byte', label: 'TTFB', unit: 'ms', good: 800, poor: 1800 }
];

/** The history endpoint only tracks the three Core Web Vitals. */
const HISTORY_METRICS = METRICS.slice(0, 3);

const { values: options } = parseArgs({
	// pnpm forwards a literal `--` from `pnpm run … -- --flag`; drop it so flags still parse
	args: process.argv.slice(2).filter((arg, i) => !(i === 0 && arg === '--')),
	options: {
		url: { type: 'string' },
		device: { type: 'string' },
		history: { type: 'boolean', default: false },
		json: { type: 'boolean', default: false }
	}
});

const apiKey = process.env.TS_PRIVATE_GOOGLE_CRUX_API_KEY?.trim();
if (!apiKey) {
	console.error('TS_PRIVATE_GOOGLE_CRUX_API_KEY is not set (add it to .env.local)');
	process.exit(1);
}

const target = options.url ? { url: options.url } : { origin: ORIGIN };
const formFactors = options.device ? [options.device.toUpperCase()] : ['PHONE', 'DESKTOP'];
const method = options.history ? 'queryHistoryRecord' : 'queryRecord';
const metrics = (options.history ? HISTORY_METRICS : METRICS).map((metric) => metric.id);

/**
 * Call the CrUX API.
 *
 * @param {'queryRecord' | 'queryHistoryRecord'} method
 * @param {Record<string, unknown>} body
 */
async function query(method, body) {
	const response = await fetch(`${API}:${method}?key=${apiKey}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
	const json = await response.json();
	if (!response.ok) {
		throw new Error(`${json.error?.status ?? response.status}: ${json.error?.message ?? 'unknown error'}`);
	}
	return json;
}

/** Rate a p75 value against the Web Vitals thresholds. */
function rating(metric, value) {
	if (value === undefined) return '—';
	if (value <= metric.good) return 'good';
	if (value <= metric.poor) return 'needs improvement';
	return 'poor';
}

const pct = (value) => `${Math.round((value ?? 0) * 100)}%`;
const isoDate = (d) => `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

function printSnapshot(formFactor, { record }) {
	const period = record.collectionPeriod;
	console.log(
		`\n${options.url ?? ORIGIN} · ${formFactor} · ${isoDate(period.firstDate)} → ${isoDate(period.lastDate)}`
	);

	console.table(
		METRICS.map((metric) => {
			const data = record.metrics[metric.id];
			const p75 = data?.percentiles?.p75;
			const [good, ni, poor] = data?.histogram ?? [];
			return {
				metric: metric.label,
				p75: p75 === undefined ? '—' : `${p75}${metric.unit}`,
				rating: rating(metric, Number(p75)),
				good: pct(good?.density),
				'needs improvement': pct(ni?.density),
				poor: pct(poor?.density)
			};
		})
	);
}

function printHistory(formFactor, { record }) {
	console.log(`\n${options.url ?? ORIGIN} · ${formFactor} · weekly p75 (28-day rolling windows)`);

	console.table(
		record.collectionPeriods.map((period, i) => ({
			'window end': isoDate(period.lastDate),
			...Object.fromEntries(
				HISTORY_METRICS.map((metric) => [
					`${metric.label}${metric.unit ? ` ${metric.unit}` : ''}`,
					record.metrics[metric.id]?.percentilesTimeseries?.p75s?.[i] ?? '—'
				])
			)
		}))
	);
}

try {
	// the form factors are independent requests, so fetch them together and print in order
	const results = await Promise.all(formFactors.map((formFactor) => query(method, { ...target, formFactor, metrics })));

	results.forEach((result, i) => {
		if (options.json) {
			console.log(JSON.stringify(result, null, 2));
		} else if (options.history) {
			printHistory(formFactors[i], result);
		} else {
			printSnapshot(formFactors[i], result);
		}
	});
} catch (error) {
	console.error(`CrUX request failed: ${error instanceof Error ? error.message : error}`);
	process.exit(1);
}
