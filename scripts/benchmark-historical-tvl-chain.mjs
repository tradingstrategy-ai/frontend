#!/usr/bin/env node

// Benchmark the same aggregation used by
// `/trading-view/vaults/historical-tvl-chain/chart-data`
// for the page at `/trading-view/vaults/historical-tvl-chain`.
//
// Local benchmark baseline from 2026-03-21 on this checkout after
// weekly daily-close averaging and dropping the current partial week:
// - Parquet size: 140.1 MiB
// - Weekly vault rows: 216,392
// - Output size: 202 weeks, 22 chain series, 50.7 KiB JSON
// - Run 1: 5325.1 ms total
//   - fetch top vaults: 2706.2 ms
//   - query parquet: 1221.7 ms
//   - reduce and group: 2618.8 ms
// - Filters: 3404 included vaults, 212 blacklisted vaults, 265 outlier points
import { stat, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { DuckDBConnection } from '@duckdb/node-api';

const HISTORICAL_TVL_CHAIN_OUTLIER_THRESHOLD = 50_000_000_000;
const DEFAULT_PARQUET_FILE = 'data/cleaned-vault-prices-1h.parquet';
const DEFAULT_ENV_FILE = '.env';

const chainGroups = new Map([
	[1, { key: 'ethereum', label: 'Ethereum', chainId: 1 }],
	[10, { key: 'optimism', label: 'Optimism', chainId: 10 }],
	[56, { key: 'binance', label: 'BNB Smart Chain', chainId: 56 }],
	[100, { key: 'gnosis', label: 'Gnosis', chainId: 100 }],
	[130, { key: 'unichain', label: 'Unichain', chainId: 130 }],
	[137, { key: 'polygon', label: 'Polygon', chainId: 137 }],
	[143, { key: 'monad', label: 'Monad', chainId: 143 }],
	[146, { key: 'sonic', label: 'Sonic', chainId: 146 }],
	[325, { key: 'grvt', label: 'Grvt', chainId: 325 }],
	[957, { key: 'derive', label: 'Derive', chainId: 957 }],
	[999, { key: 'hyperliquid', label: 'Hyperliquid', chainId: 999 }],
	[1868, { key: 'soneium', label: 'Soneium', chainId: 1868 }],
	[5000, { key: 'mantle', label: 'Mantle', chainId: 5000 }],
	[8453, { key: 'base', label: 'Base', chainId: 8453 }],
	[9745, { key: 'plasma', label: 'Plasma', chainId: 9745 }],
	[9998, { key: 'lighter', label: 'Lighter', chainId: 9998 }],
	[9999, { key: 'hyperliquid', label: 'Hyperliquid', chainId: 9999 }],
	[34443, { key: 'mode', label: 'Mode', chainId: 34443 }],
	[42161, { key: 'arbitrum', label: 'Arbitrum One', chainId: 42161 }],
	[43111, { key: 'hemi', label: 'Hemi', chainId: 43111 }],
	[43114, { key: 'avalanche', label: 'Avalanche C-chain', chainId: 43114 }],
	[59144, { key: 'linea', label: 'Linea', chainId: 59144 }],
	[80094, { key: 'berachain', label: 'Berachain', chainId: 80094 }],
	[81457, { key: 'blast', label: 'Blast', chainId: 81457 }],
	[747474, { key: 'katana', label: 'Katana', chainId: 747474 }]
]);

function printUsage() {
	console.log(`Usage: node scripts/benchmark-historical-tvl-chain.mjs [options]

Options:
  --parquet-file <path>     Override the Parquet file path
  --top-vaults-url <url>    Override the top vault metadata URL
  --env-file <path>         Read TS_PUBLIC_TOP_VAULTS_URL from a specific env file
  --runs <count>            Run the benchmark multiple times (default: 1)
  --output <path>           Write the last payload JSON to a file
  --help                    Show this help
`);
}

function parseArgs(argv) {
	const options = {
		parquetFile: DEFAULT_PARQUET_FILE,
		topVaultsUrl: process.env.TOP_VAULTS_URL || process.env.TS_PUBLIC_TOP_VAULTS_URL || '',
		envFile: DEFAULT_ENV_FILE,
		runs: 1,
		output: ''
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];

		if (arg === '--') {
			continue;
		}

		if (arg === '--help') {
			options.help = true;
			continue;
		}

		if (!arg.startsWith('--')) {
			throw new Error(`Unexpected argument: ${arg}`);
		}

		const value = argv[index + 1];
		if (!value || value.startsWith('--')) {
			throw new Error(`Missing value for ${arg}`);
		}

		if (arg === '--parquet-file') options.parquetFile = value;
		else if (arg === '--top-vaults-url') options.topVaultsUrl = value;
		else if (arg === '--env-file') options.envFile = value;
		else if (arg === '--runs') options.runs = Number.parseInt(value, 10);
		else if (arg === '--output') options.output = value;
		else throw new Error(`Unknown argument: ${arg}`);

		index += 1;
	}

	if (!Number.isInteger(options.runs) || options.runs < 1) {
		throw new Error(`Invalid --runs value: ${String(options.runs)}`);
	}

	return options;
}

async function readEnvValue(filePath, key) {
	try {
		const content = await readFile(filePath, 'utf8');
		for (const rawLine of content.split('\n')) {
			const line = rawLine.trim();
			if (!line || line.startsWith('#')) continue;
			if (!line.startsWith(`${key}=`)) continue;

			const value = line.slice(key.length + 1).trim();
			return value.replace(/^['"`]/, '').replace(/['"`]$/, '');
		}
	} catch {
		return undefined;
	}
}

function parseDate(value) {
	if (value instanceof Date) return value;
	if (value === null || value === undefined) return undefined;

	let numeric = Number(value);
	if (Number.isFinite(numeric)) {
		if (numeric < 10_000_000_000) numeric *= 1000;
		return new Date(numeric);
	}

	if (typeof value === 'string') {
		if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)) {
			value += 'Z';
		}

		const parsed = new Date(value);
		return Number.isFinite(parsed.valueOf()) ? parsed : undefined;
	}

	return undefined;
}

function normaliseWeek(value) {
	const parsed = parseDate(value) ?? parseDate(String(value));
	if (!parsed) throw new Error(`Invalid week value: ${String(value)}`);
	return parsed.toISOString().slice(0, 10);
}

function resolveDisplayChain(chainId, fallbackName) {
	const chain = chainGroups.get(chainId);
	if (chain) return chain;

	return {
		key: `chain-${chainId}`,
		label: fallbackName || `Chain ${chainId}`,
		chainId
	};
}

function forwardFillWeeklyRows(rows) {
	const normalisedRows = rows
		.map((row) => ({
			...row,
			week: normaliseWeek(row.week)
		}))
		.sort(
			(left, right) =>
				left.id.localeCompare(right.id) ||
				left.chainId - right.chainId ||
				String(left.week).localeCompare(String(right.week))
		);

	const allWeeks = [...new Set(normalisedRows.map((row) => String(row.week)))].sort((left, right) =>
		left.localeCompare(right)
	);
	if (allWeeks.length === 0) return [];

	const weekIndex = new Map(allWeeks.map((week, index) => [week, index]));
	const rowsByVault = new Map();

	for (const row of normalisedRows) {
		const key = `${row.id}::${row.chainId}`;
		const group = rowsByVault.get(key) ?? [];
		group.push(row);
		rowsByVault.set(key, group);
	}

	const filledRows = [];

	for (const vaultRows of rowsByVault.values()) {
		const firstWeekIndex = weekIndex.get(String(vaultRows[0].week));
		if (firstWeekIndex === undefined) continue;
		const rowsByWeek = new Map(vaultRows.map((row) => [String(row.week), row]));
		let lastSeenTvl = null;

		for (let index = firstWeekIndex; index < allWeeks.length; index += 1) {
			const week = allWeeks[index];
			const row = rowsByWeek.get(week);
			if (row) {
				lastSeenTvl = row.tvl;
				filledRows.push(row);
			} else if (lastSeenTvl !== null) {
				filledRows.push({
					id: vaultRows[0].id,
					chainId: vaultRows[0].chainId,
					week,
					tvl: lastSeenTvl
				});
			}
		}
	}

	return filledRows.sort(
		(left, right) =>
			String(left.week).localeCompare(String(right.week)) ||
			left.chainId - right.chainId ||
			left.id.localeCompare(right.id)
	);
}

function buildPayload(rows, vaults, durationMs) {
	const metadataById = new Map(vaults.map((vault) => [vault.id, vault]));
	const includedVaultIds = new Set(vaults.filter((vault) => vault.risk_numeric !== 999).map((vault) => vault.id));
	const blacklistedVaultIds = new Set(vaults.filter((vault) => vault.risk_numeric === 999).map((vault) => vault.id));

	const weeks = new Set();
	const includedIds = new Set();
	const excludedBlacklistedIds = new Set();
	const groups = new Map();
	const includedRows = [];
	let excludedOutlierPoints = 0;

	for (const row of rows) {
		if (!Number.isFinite(row.tvl) || row.tvl < 0) continue;

		if (row.tvl > HISTORICAL_TVL_CHAIN_OUTLIER_THRESHOLD) {
			excludedOutlierPoints += 1;
			continue;
		}

		if (!includedVaultIds.has(row.id)) {
			if (blacklistedVaultIds.has(row.id)) excludedBlacklistedIds.add(row.id);
			continue;
		}

		const metadata = metadataById.get(row.id);
		const chainId = metadata?.chain_id ?? row.chainId;
		includedRows.push({
			id: row.id,
			chainId,
			week: normaliseWeek(row.week),
			tvl: row.tvl
		});
		includedIds.add(row.id);
	}

	for (const row of forwardFillWeeklyRows(includedRows)) {
		const metadata = metadataById.get(row.id);
		const week = normaliseWeek(row.week);
		const displayChain = resolveDisplayChain(row.chainId, metadata?.chain);
		const group = groups.get(displayChain.key) ?? {
			key: displayChain.key,
			label: displayChain.label,
			chainIds: new Set(),
			weekTotals: new Map()
		};

		group.chainIds.add(displayChain.chainId);
		group.weekTotals.set(week, (group.weekTotals.get(week) ?? 0) + row.tvl);

		groups.set(displayChain.key, group);
		weeks.add(week);
	}

	const sortedWeeks = [...weeks].sort((left, right) => left.localeCompare(right));
	const latestWeekIndex = sortedWeeks.length - 1;

	const series = [...groups.values()]
		.map((group) => ({
			key: group.key,
			label: group.label,
			chainIds: [...group.chainIds].sort((left, right) => left - right),
			values: sortedWeeks.map((week) => group.weekTotals.get(week) ?? 0)
		}))
		.sort((left, right) => {
			const leftLatest = latestWeekIndex >= 0 ? (left.values[latestWeekIndex] ?? 0) : 0;
			const rightLatest = latestWeekIndex >= 0 ? (right.values[latestWeekIndex] ?? 0) : 0;
			return rightLatest - leftLatest || left.label.localeCompare(right.label);
		});

	return {
		generatedAt: new Date().toISOString(),
		durationMs: Math.round(durationMs),
		cacheTtlSeconds: 24 * 60 * 60,
		weeks: sortedWeeks,
		series,
		meta: {
			rawWeeklyVaultPoints: rows.length,
			includedVaults: includedIds.size,
			excludedBlacklistedVaults: excludedBlacklistedIds.size,
			excludedOutlierPoints
		}
	};
}

async function fetchTopVaults(topVaultsUrl) {
	const startedAt = performance.now();
	const response = await fetch(topVaultsUrl);
	if (!response.ok) {
		throw new Error(`Top vault metadata request failed: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	const durationMs = performance.now() - startedAt;
	const vaults = Array.isArray(data?.vaults) ? data.vaults : [];

	return { data, vaults, durationMs };
}

async function getWeeklyVaultRows(parquetFile) {
	const connection = await DuckDBConnection.create();
	const startedAt = performance.now();

	try {
		const reader = await connection.runAndReadAll(
			`
				WITH daily AS (
					SELECT
						id,
						chain AS chain_id,
						CAST(timestamp AS DATE) AS day,
						arg_max(total_assets, timestamp) AS tvl
					FROM parquet_scan($parquetFile)
					WHERE total_assets >= 0
					GROUP BY 1, 2, 3
				),
				weekly AS (
					SELECT
						id,
						chain_id,
						date_trunc('week', day) AS week,
						avg(tvl) AS tvl
					FROM daily
					GROUP BY 1, 2, 3
				)
				SELECT
					id,
					chain_id,
					week,
					tvl
				FROM weekly
				WHERE week < date_trunc('week', current_date)
				ORDER BY 3, 2, 1
			`,
			{ parquetFile }
		);

		const rows = reader.getRows().map(([id, chainId, week, tvl]) => ({
			id: String(id),
			chainId: Number(chainId),
			week,
			tvl: Number(tvl)
		}));

		return { rows, durationMs: performance.now() - startedAt };
	} finally {
		connection.closeSync();
	}
}

function formatMs(value) {
	return `${value.toFixed(1)} ms`;
}

function formatBytes(value) {
	if (value < 1024) return `${value} B`;
	if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KiB`;
	if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MiB`;
	return `${(value / 1024 ** 3).toFixed(1)} GiB`;
}

function getLatestSeriesSummary(payload, limit = 8) {
	if (payload.weeks.length === 0) return [];
	const latestWeekIndex = payload.weeks.length - 1;
	return payload.series.slice(0, limit).map((series) => ({
		label: series.label,
		latestTvl: series.values[latestWeekIndex] ?? 0
	}));
}

async function runBenchmark({ parquetFile, topVaultsUrl }) {
	const totalStartedAt = performance.now();
	const [parquetStats, topVaultsResult, weeklyResult] = await Promise.all([
		stat(parquetFile),
		fetchTopVaults(topVaultsUrl),
		getWeeklyVaultRows(parquetFile)
	]);

	const reduceStartedAt = performance.now();
	const payload = buildPayload(weeklyResult.rows, topVaultsResult.vaults, performance.now() - totalStartedAt);
	const reduceDurationMs = performance.now() - reduceStartedAt;
	const totalDurationMs = performance.now() - totalStartedAt;
	const payloadBytes = Buffer.byteLength(JSON.stringify(payload));

	return {
		parquetBytes: parquetStats.size,
		vaultCount: topVaultsResult.vaults.length,
		weeklyRows: weeklyResult.rows.length,
		payload,
		payloadBytes,
		timings: {
			topVaultsFetchMs: topVaultsResult.durationMs,
			parquetQueryMs: weeklyResult.durationMs,
			reduceMs: reduceDurationMs,
			totalMs: totalDurationMs
		}
	};
}

function printRunSummary(runIndex, runCount, result) {
	const { payload, payloadBytes, parquetBytes, vaultCount, weeklyRows, timings } = result;

	console.log('');
	console.log(`Run ${runIndex}/${runCount}`);
	console.log(`  Parquet size: ${formatBytes(parquetBytes)}`);
	console.log(`  Vault metadata: ${vaultCount} vaults fetched in ${formatMs(timings.topVaultsFetchMs)}`);
	console.log(`  Weekly vault rows: ${weeklyRows}`);
	console.log(`  Timings:`);
	console.log(`    fetch top vaults: ${formatMs(timings.topVaultsFetchMs)}`);
	console.log(`    query parquet: ${formatMs(timings.parquetQueryMs)}`);
	console.log(`    reduce and group: ${formatMs(timings.reduceMs)}`);
	console.log(`    total wall time: ${formatMs(timings.totalMs)}`);
	console.log(
		`  Output: ${payload.weeks.length} weeks, ${payload.series.length} chain series, ${formatBytes(payloadBytes)} JSON`
	);
	console.log(
		`  Filters: ${payload.meta.includedVaults} included vaults, ${payload.meta.excludedBlacklistedVaults} blacklisted vaults, ${payload.meta.excludedOutlierPoints} outlier points`
	);

	const latestWeek = payload.weeks.at(-1);
	if (latestWeek) {
		console.log(`  Latest week: ${latestWeek}`);
		for (const item of getLatestSeriesSummary(payload)) {
			console.log(`    ${item.label}: ${item.latestTvl.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`);
		}
	}
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		printUsage();
		return;
	}

	if (!options.topVaultsUrl) {
		options.topVaultsUrl = (await readEnvValue(options.envFile, 'TS_PUBLIC_TOP_VAULTS_URL')) || '';
	}

	if (!options.topVaultsUrl) {
		throw new Error(
			'Could not determine top vault metadata URL. Pass --top-vaults-url or set TOP_VAULTS_URL / TS_PUBLIC_TOP_VAULTS_URL.'
		);
	}

	console.log('Historical TVL by chain benchmark');
	console.log(`Parquet file: ${options.parquetFile}`);
	console.log(`Top vaults URL: ${options.topVaultsUrl}`);
	console.log(`Runs: ${options.runs}`);

	const totalDurations = [];
	let lastPayload = null;

	for (let runIndex = 1; runIndex <= options.runs; runIndex += 1) {
		const result = await runBenchmark(options);

		totalDurations.push(result.timings.totalMs);
		lastPayload = result.payload;
		printRunSummary(runIndex, options.runs, result);
	}

	if (options.output && lastPayload) {
		await writeFile(options.output, JSON.stringify(lastPayload, null, 2));
		console.log('');
		console.log(`Wrote payload JSON to ${options.output}`);
	}

	if (totalDurations.length > 1) {
		const min = Math.min(...totalDurations);
		const max = Math.max(...totalDurations);
		const average = totalDurations.reduce((sum, value) => sum + value, 0) / totalDurations.length;

		console.log('');
		console.log('Summary');
		console.log(`  Fastest run: ${formatMs(min)}`);
		console.log(`  Slowest run: ${formatMs(max)}`);
		console.log(`  Average run: ${formatMs(average)}`);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
