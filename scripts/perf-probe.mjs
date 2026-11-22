/**
 * Repeatable mobile page-speed probe: loads pages in a throttled, phone-emulated Chromium and
 * reports the median and range of load metrics, and optionally of interaction latency.
 *
 * Single PageSpeed Insights runs are too noisy to decide on (the same URL scored 0.9–4.2 s
 * simulated LCP in three runs on 2026-11-22), so every change in the mobile speed work is
 * judged on the median of several runs of this script instead. See docs/speed.md.
 *
 * Usage:
 *
 *   pnpm run perf:probe                                  # production, default URL set, 5 runs
 *   pnpm run perf:probe --base http://127.0.0.1:5173     # local dev server or build
 *   pnpm run perf:probe --url /vaults/protocols/morpho --runs 9
 *   pnpm run perf:probe --interactions                   # sort, filter, menu, compare latency
 *   pnpm run perf:probe --cpu 1 --no-network-throttle    # unthrottled
 *   pnpm run perf:probe --channel chrome                 # installed Google Chrome
 *   pnpm run perf:probe --json out.json                  # raw runs for later comparison
 *
 * Load metrics per run: TTFB, FCP, LCP (and the LCP element), DOMContentLoaded, load, TBT
 * (long tasks from FCP to 8 s after navigation start, the window fixed so deferred work
 * cannot fall outside it), CLS, HTML transfer and decoded size, request count, and the
 * document's `cf-cache-status`.
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { chromium, devices } from 'playwright';

const DEFAULT_URLS = [
	'/',
	'/vaults',
	'/vaults/protocols/morpho',
	'/vaults/protocols/lighter',
	'/vaults/curators/steakhouse-financial',
	'/vaults/stablecoins/usdc',
	'/vaults/rektober',
	'/glossary/morpho'
];

/** Pages with a vault listing table, used by `--interactions`. */
const DEFAULT_INTERACTION_URLS = ['/vaults', '/vaults/protocols/morpho'];

/** End of the TBT window, ms after navigation start. */
const TBT_WINDOW_END = 8000;

// pnpm forwards a literal `--` from `pnpm run … -- --flag`; drop it so flags still parse
const args = process.argv.slice(2).filter((arg) => arg !== '--');

const { values: options } = parseArgs({
	args,
	options: {
		base: { type: 'string', default: 'https://tradingstrategy.ai' },
		url: { type: 'string', multiple: true },
		runs: { type: 'string', default: '5' },
		cpu: { type: 'string', default: '4' },
		'no-network-throttle': { type: 'boolean', default: false },
		channel: { type: 'string' },
		interactions: { type: 'boolean', default: false },
		'cache-bust': { type: 'boolean', default: false },
		json: { type: 'string' }
	}
});

const runs = Number(options.runs);
const cpuRate = Number(options.cpu);
const networkThrottle = !options['no-network-throttle'];
const urls = options.url ?? (options.interactions ? DEFAULT_INTERACTION_URLS : DEFAULT_URLS);

/** Slow 4G as used by Lighthouse mobile: 150 ms RTT, 1.6 Mbit/s down, 750 kbit/s up. */
const NETWORK_CONDITIONS = {
	offline: false,
	latency: 150,
	downloadThroughput: (1.6 * 1024 * 1024) / 8,
	uploadThroughput: (750 * 1024) / 8
};

function gitRevision() {
	try {
		return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
	} catch {
		return 'unknown';
	}
}

/**
 * Observers installed before any page script runs. They buffer LCP candidates, long tasks,
 * layout shifts and event timings into `window.__probe` for `collectLoadMetrics()`.
 */
function installObservers() {
	const probe = { lcp: [], longTasks: [], cls: 0, events: [] };
	window.__probe = probe;
	const observe = (type, callback, extra = {}) => {
		try {
			new PerformanceObserver((list) => list.getEntries().forEach(callback)).observe({
				type,
				buffered: true,
				...extra
			});
		} catch {
			// entry type not supported by this browser
		}
	};
	observe('largest-contentful-paint', (entry) => {
		const el = entry.element;
		probe.lcp.push({
			time: entry.startTime,
			size: entry.size,
			element: el ? `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}` : null
		});
	});
	observe('longtask', (entry) => probe.longTasks.push([entry.startTime, entry.duration]));
	observe('layout-shift', (entry) => {
		if (!entry.hadRecentInput) probe.cls += entry.value;
	});
	observe(
		'event',
		(entry) => {
			if (entry.interactionId) probe.events.push({ name: entry.name, duration: entry.duration });
		},
		{ durationThreshold: 16 }
	);
}

/** Read the buffered metrics once the TBT window has passed. */
function collectLoadMetrics(tbtWindowEnd) {
	const probe = window.__probe;
	const nav = performance.getEntriesByType('navigation')[0];
	const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null;
	const lcp = probe.lcp.at(-1) ?? null;
	const tbt = probe.longTasks.reduce((sum, [start, duration]) => {
		const end = Math.min(start + duration, tbtWindowEnd);
		const from = Math.max(start, fcp ?? 0);
		return end - from > 50 ? sum + (end - from - 50) : sum;
	}, 0);
	return {
		ttfb: nav.responseStart,
		fcp,
		lcp: lcp?.time ?? null,
		lcpElement: lcp?.element ?? null,
		dcl: nav.domContentLoadedEventEnd,
		load: nav.loadEventEnd,
		tbt,
		cls: probe.cls,
		htmlTransfer: nav.transferSize,
		htmlDecoded: nav.decodedBodySize,
		requests: performance.getEntriesByType('resource').length + 1
	};
}

async function newPage(browser) {
	const context = await browser.newContext({ ...devices['Moto G4'] });
	const page = await context.newPage();
	const cdp = await context.newCDPSession(page);
	if (cpuRate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
	if (networkThrottle) await cdp.send('Network.emulateNetworkConditions', NETWORK_CONDITIONS);
	await page.addInitScript(installObservers);
	return { context, page };
}

function targetUrl(path, run) {
	const url = new URL(path, options.base);
	if (options['cache-bust']) url.searchParams.set('probe', `${Date.now()}-${run}`);
	return url.href;
}

async function probeLoad(browser, path, run) {
	const { context, page } = await newPage(browser);
	try {
		const response = await page.goto(targetUrl(path, run), { waitUntil: 'load', timeout: 60_000 });
		await page.waitForFunction((end) => performance.now() >= end, TBT_WINDOW_END, { timeout: 30_000 });
		const metrics = await page.evaluate(collectLoadMetrics, TBT_WINDOW_END);
		return { ...metrics, status: response?.status(), cfCache: response?.headers()['cf-cache-status'] ?? null };
	} finally {
		await context.close();
	}
}

/**
 * Interactions measured on a listing page after hydration. Each returns false when the
 * control is not on the page, so the step is reported as missing instead of failing.
 */
const INTERACTIONS = [
	{
		name: 'open menu',
		run: (page) => clickIfPresent(page, '#navigation-panel-toggle')
	},
	{
		name: 'close menu',
		run: (page) =>
			clickIfPresent(page, 'nav[aria-label="Mobile navigation"] button[aria-label="Close navigation panel"]')
	},
	{
		name: 'sort column',
		run: (page) => clickIfPresent(page, 'table thead th button')
	},
	{
		name: 'compare checkbox',
		run: (page) => clickIfPresent(page, '[data-testid="vault-comparison-checkbox"]')
	},
	{
		name: 'open filters',
		run: async (page) =>
			(await clickIfPresent(page, '[data-testid="mobile-filters-trigger"]')) ||
			clickIfPresent(page, '[data-testid="filters-summary"]')
	}
];

async function clickIfPresent(page, selector) {
	const locator = page.locator(selector).first();
	if (!(await locator.isVisible().catch(() => false))) return false;
	await locator.click({ timeout: 5_000 });
	return true;
}

async function probeInteractions(browser, path, run) {
	const { context, page } = await newPage(browser);
	try {
		await page.goto(targetUrl(path, run), { waitUntil: 'load', timeout: 60_000 });
		await page.waitForSelector('#navigation-panel-toggle[data-navigation-hydrated="true"]', { timeout: 30_000 });
		await page.waitForTimeout(2_000);
		const result = {};
		for (const interaction of INTERACTIONS) {
			await page.evaluate(() => (window.__probe.events = []));
			const present = await interaction.run(page);
			await page.waitForTimeout(1_000);
			result[interaction.name] = present
				? await page.evaluate(() => Math.max(0, ...window.__probe.events.map((e) => e.duration)))
				: null;
		}
		return result;
	} finally {
		await context.close();
	}
}

function median(values) {
	const sorted = values.filter((v) => typeof v === 'number').toSorted((a, b) => a - b);
	if (!sorted.length) return null;
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function summarise(values, format) {
	const numbers = values.filter((v) => typeof v === 'number');
	if (!numbers.length) return '—';
	const med = format(median(numbers));
	if (numbers.length === 1) return med;
	return `${med} (${format(Math.min(...numbers))}–${format(Math.max(...numbers))})`;
}

const ms = (v) => `${Math.round(v)}`;
const kb = (v) => `${Math.round(v / 1024)}`;
const fixed3 = (v) => v.toFixed(3);

const browser = await chromium.launch(options.channel ? { channel: options.channel } : {});
const report = {
	base: options.base,
	revision: gitRevision(),
	date: new Date().toISOString(),
	runs,
	cpuRate,
	networkThrottle,
	pages: {}
};

console.log(
	`perf-probe ${options.base} · rev ${report.revision} · ${runs} runs · CPU ${cpuRate}× · ` +
		`network ${networkThrottle ? 'slow 4G' : 'unthrottled'} · ${options.channel ?? 'bundled Chromium'}`
);

try {
	for (const path of urls) {
		const results = [];
		for (let run = 0; run < runs; run++) {
			try {
				results.push(
					options.interactions ? await probeInteractions(browser, path, run) : await probeLoad(browser, path, run)
				);
			} catch (error) {
				console.error(`  ${path} run ${run + 1} failed: ${error instanceof Error ? error.message : error}`);
			}
		}
		report.pages[path] = results;
		if (!results.length) continue;

		if (options.interactions) {
			console.log(`\n${path} — interaction duration, ms: median (min–max)`);
			console.table(
				Object.fromEntries(
					INTERACTIONS.map(({ name }) => [
						name,
						{
							duration: summarise(
								results.map((r) => r[name]),
								ms
							)
						}
					])
				)
			);
			continue;
		}

		const lcpElements = [...new Set(results.map((r) => r.lcpElement).filter(Boolean))].join(', ');
		const cache = [...new Set(results.map((r) => r.cfCache ?? 'none'))].join(', ');
		console.log(`\n${path} — median (min–max) · LCP element: ${lcpElements || '—'} · cf-cache-status: ${cache}`);
		console.table({
			'TTFB ms': {
				value: summarise(
					results.map((r) => r.ttfb),
					ms
				)
			},
			'FCP ms': {
				value: summarise(
					results.map((r) => r.fcp),
					ms
				)
			},
			'LCP ms': {
				value: summarise(
					results.map((r) => r.lcp),
					ms
				)
			},
			'DCL ms': {
				value: summarise(
					results.map((r) => r.dcl),
					ms
				)
			},
			'load ms': {
				value: summarise(
					results.map((r) => r.load),
					ms
				)
			},
			'TBT ms': {
				value: summarise(
					results.map((r) => r.tbt),
					ms
				)
			},
			CLS: {
				value: summarise(
					results.map((r) => r.cls),
					fixed3
				)
			},
			'HTML KB (transfer)': {
				value: summarise(
					results.map((r) => r.htmlTransfer),
					kb
				)
			},
			'HTML KB (decoded)': {
				value: summarise(
					results.map((r) => r.htmlDecoded),
					kb
				)
			},
			requests: {
				value: summarise(
					results.map((r) => r.requests),
					ms
				)
			}
		});
	}
} finally {
	await browser.close();
}

if (options.json) {
	writeFileSync(options.json, JSON.stringify(report, null, '\t'));
	console.log(`\nRaw runs written to ${options.json}`);
}
