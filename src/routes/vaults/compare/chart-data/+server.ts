import { promisify } from 'node:util';
import { brotliCompress, constants } from 'node:zlib';
import { error } from '@sveltejs/kit';
import { utcDay, utcHour } from 'd3-time';
import { queryVaultPriceRows } from '$lib/server/top-vaults/vault-price-series';
import { fetchCoinbaseBenchmarkCloses } from '$lib/top-vaults/coinbase';
import {
	alignVaultEquityCurves,
	calculateComparisonPeriodMetrics,
	indexBenchmarkPrices,
	resampleComparisonPoints
} from '$lib/top-vaults/equity-comparison/equity-curves';
import {
	MAX_SELECTED_VAULTS,
	canonicaliseComparisonBenchmarks,
	canonicaliseComparisonVaultIds
} from '$lib/top-vaults/equity-comparison/state';
import type {
	AlignedEquityPoint,
	AlignedVaultSeries,
	ComparisonBenchmark,
	ComparisonChartPoint,
	ComparisonChartSeries,
	VaultComparisonChartResponse,
	VaultPriceSeries
} from '$lib/top-vaults/equity-comparison/types';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { fetchTreasuryBenchmarkSeries, ratesToCumulativeReturn } from '$lib/top-vaults/treasury-benchmark';

const CACHE_TTL_MS = 5 * 60 * 1000;
const RECENT_FOUR_HOUR_DAYS = 35;
const fourHours = utcHour.every(4)!;
const compress = promisify(brotliCompress);
type CachedResponse = { json: string; br: Uint8Array };
const responseCache = new Map<string, { expiresAt: number; response: Promise<CachedResponse> }>();

const cacheHeaders = {
	'cache-control': 'public, max-age=300',
	'content-type': 'application/json',
	vary: 'Accept-Encoding'
};

export async function GET({ fetch, request, url }) {
	const requestedVaultIds = url.searchParams.getAll('vault');
	const vaultIds = canonicaliseComparisonVaultIds(requestedVaultIds);
	const requestedBenchmarks = url.searchParams.getAll('benchmark');
	const benchmarks = canonicaliseComparisonBenchmarks(requestedBenchmarks);

	if (!requestedVaultIds.length) error(400, 'At least one vault is required');
	if (
		requestedVaultIds.length > MAX_SELECTED_VAULTS ||
		requestedVaultIds.length !== vaultIds.length ||
		requestedVaultIds.some((value, index) => value !== vaultIds[index])
	) {
		error(400, `Provide up to ${MAX_SELECTED_VAULTS} unique, non-empty vault IDs`);
	}
	if (
		requestedBenchmarks.length !== benchmarks.length ||
		requestedBenchmarks.some((value, index) => value !== benchmarks[index])
	) {
		error(400, 'Provide unique supported benchmarks in canonical order');
	}

	const cacheKey = JSON.stringify([vaultIds, benchmarks]);
	const now = Date.now();
	const cached = responseCache.get(cacheKey);
	if (cached && cached.expiresAt > now) {
		return chartResponse(await cached.response, request);
	}

	const response = buildComparisonChartResponse(fetch, vaultIds, benchmarks)
		.then(async (payload) => {
			const json = JSON.stringify(payload);
			const br = new Uint8Array(
				await compress(new TextEncoder().encode(json), {
					params: { [constants.BROTLI_PARAM_QUALITY]: 6 }
				})
			);
			return { json, br };
		})
		.catch((cause) => {
			responseCache.delete(cacheKey);
			throw cause;
		});
	responseCache.set(cacheKey, { expiresAt: now + CACHE_TTL_MS, response });
	trimResponseCache(now);

	return chartResponse(await response, request);
}

function chartResponse(data: CachedResponse, request: Request): Response {
	if (request.headers.get('accept-encoding')?.includes('br')) {
		return new Response(data.br as BodyInit, { headers: { ...cacheHeaders, 'content-encoding': 'br' } });
	}
	return new Response(data.json, { headers: cacheHeaders });
}

/** Build the complete public chart payload from server-private vault history. */
async function buildComparisonChartResponse(
	fetch: Fetch,
	vaultIds: string[],
	benchmarks: ComparisonBenchmark[]
): Promise<VaultComparisonChartResponse> {
	const { vaults } = await getCachedTopVaults(fetch);
	const knownVaultIds = new Set(vaults.map(({ id }) => id));
	const queryIds = vaultIds.filter((vaultId) => knownVaultIds.has(vaultId));
	const rows = await queryVaultPriceRows(queryIds);
	const pointsById = new Map<string, [number, number][]>();

	for (const { id, timestamp, sharePrice } of rows) {
		if (!Number.isFinite(timestamp) || !Number.isFinite(sharePrice) || sharePrice <= 0) continue;
		const points = pointsById.get(id) ?? [];
		points.push([timestamp, sharePrice]);
		pointsById.set(id, points);
	}

	const rawSeries: VaultPriceSeries[] = [];
	const missingVaultIds: string[] = [];
	for (const vaultId of vaultIds) {
		const points = pointsById.get(vaultId);
		if (points?.length) rawSeries.push({ id: vaultId, points });
		else missingVaultIds.push(vaultId);
	}

	const alignedSeries = alignVaultEquityCurves(rawSeries);
	const starts = alignedSeries.flatMap(({ points }) => (points[0] ? [points[0].time] : []));
	const ends = alignedSeries.flatMap(({ points }) => (points.at(-1) ? [points.at(-1)!.time] : []));
	const range: [number, number] | null = starts.length && ends.length ? [Math.min(...starts), Math.max(...ends)] : null;
	const recentStart = range ? range[1] - RECENT_FOUR_HOUR_DAYS * 86_400 : 0;
	const vaultSeries = range ? alignedSeries.map((series) => buildProcessedSeries(series, recentStart, range)) : [];
	const benchmarkSeries: ComparisonChartSeries[] = [];
	const benchmarkErrors: Partial<Record<ComparisonBenchmark, string>> = {};

	if (range) {
		await Promise.all(
			benchmarks.map(async (benchmark) => {
				try {
					benchmarkSeries.push(await buildBenchmarkSeries(fetch, benchmark, range, recentStart));
				} catch (cause) {
					console.error(`Failed to prepare ${benchmark} comparison benchmark`, cause);
					benchmarkErrors[benchmark] = 'Unavailable';
				}
			})
		);
		benchmarkSeries.sort(
			(left, right) =>
				benchmarks.indexOf(left.id as ComparisonBenchmark) - benchmarks.indexOf(right.id as ComparisonBenchmark)
		);
	}

	return { range, vaultSeries, benchmarkSeries, missingVaultIds, benchmarkErrors };
}

function buildProcessedSeries(
	series: AlignedVaultSeries,
	recentStart: number,
	range: [number, number]
): ComparisonChartSeries {
	const { id, points, discontinuous } = series;
	const processedPoints = {
		'4h': resampleComparisonPoints(points, fourHours).filter(({ time }) => time >= recentStart),
		'1d': resampleComparisonPoints(points, utcDay)
	};
	return {
		id,
		discontinuous,
		points: processedPoints,
		periodMetrics: calculateComparisonPeriodMetrics(processedPoints, range)
	};
}

async function buildBenchmarkSeries(
	fetch: Fetch,
	benchmark: ComparisonBenchmark,
	range: [number, number],
	recentStart: number
): Promise<ComparisonChartSeries> {
	const start = new Date(range[0] * 1000);
	const end = new Date(range[1] * 1000);

	if (benchmark === 'treasury') {
		const rates = await fetchTreasuryBenchmarkSeries(fetch, start, end, false);
		const points = {
			'4h': ratesToCumulativeReturn(rates, 100, fourHours, start, end)
				.map(({ time, value }) => toBenchmarkPoint(Number(time), value))
				.filter(({ time }) => time >= recentStart),
			'1d': ratesToCumulativeReturn(rates, 100, utcDay, start, end).map(({ time, value }) =>
				toBenchmarkPoint(Number(time), value)
			)
		};
		return {
			id: benchmark,
			discontinuous: false,
			points,
			periodMetrics: calculateComparisonPeriodMetrics(points, range)
		};
	}

	const source = await fetchCoinbaseBenchmarkCloses(
		fetch,
		benchmark === 'btc' ? 'BTC-USD' : 'ETH-USD',
		start,
		end,
		false
	);
	const indexedPoints: AlignedEquityPoint[] = indexBenchmarkPrices(source).map(([time, value]) => ({ time, value }));
	return buildProcessedSeries(
		{ id: benchmark, anchor: 100, discontinuous: false, points: indexedPoints },
		recentStart,
		range
	);
}

function toBenchmarkPoint(time: number, value: number): ComparisonChartPoint {
	return { time, value };
}

function trimResponseCache(now: number): void {
	for (const [key, entry] of responseCache) {
		if (entry.expiresAt <= now) responseCache.delete(key);
	}
	while (responseCache.size > 50) responseCache.delete(responseCache.keys().next().value!);
}
