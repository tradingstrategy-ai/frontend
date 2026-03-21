import { getChain } from '$lib/helpers/chain';
import { parseDate } from '$lib/helpers/date';
import { slugify } from '$lib/helpers/slugify';
import { formatStablecoinDisplayName, resolveStablecoinSlug } from '$lib/stablecoin-metadata/helpers';
import { getProtocolDisplayName } from '$lib/top-vaults/helpers';
import type { VaultInfo } from '$lib/top-vaults/schemas';

export const HISTORICAL_TVL_OUTLIER_THRESHOLD = 50_000_000_000;
export const HISTORICAL_TVL_CACHE_TTL_SECONDS = 24 * 60 * 60;

export interface HistoricalVaultSnapshotRow {
	id: string;
	chainId: number;
	timestamp: string | Date;
	tvl: number;
}

export interface HistoricalWeeklyVaultRow {
	id: string;
	chainId: number;
	week: string | Date;
	tvl: number;
}

export interface HistoricalTvlSeriesBase {
	key: string;
	label: string;
	values: number[];
}

export interface HistoricalTvlByChainSeries extends HistoricalTvlSeriesBase {
	chainIds: number[];
}

export interface HistoricalTvlByStablecoinSeries extends HistoricalTvlSeriesBase {
	stablecoinSlug: string;
}

export interface HistoricalTvlByProtocolSeries extends HistoricalTvlSeriesBase {
	protocolSlug: string;
}

export interface HistoricalTvlPayloadMeta {
	rawWeeklyVaultPoints: number;
	includedVaults: number;
	excludedBlacklistedVaults: number;
	excludedOutlierPoints: number;
}

export interface HistoricalTvlPayload<TSeries extends HistoricalTvlSeriesBase = HistoricalTvlSeriesBase> {
	generatedAt: string;
	durationMs: number;
	cacheTtlSeconds: number;
	weeks: string[];
	series: TSeries[];
	meta: HistoricalTvlPayloadMeta;
}

export type HistoricalTvlByChainPayload = HistoricalTvlPayload<HistoricalTvlByChainSeries>;
export type HistoricalTvlByStablecoinPayload = HistoricalTvlPayload<HistoricalTvlByStablecoinSeries>;
export type HistoricalTvlByProtocolPayload = HistoricalTvlPayload<HistoricalTvlByProtocolSeries>;

type HistoricalVaultMetadata = Pick<
	VaultInfo,
	| 'id'
	| 'risk_numeric'
	| 'chain_id'
	| 'chain'
	| 'denomination'
	| 'normalised_denomination'
	| 'denomination_slug'
	| 'protocol'
	| 'protocol_slug'
>;

interface DisplayChainGroup {
	key: string;
	label: string;
	chainIds: Set<number>;
	weekTotals: Map<string, number>;
}

interface DisplayStablecoinGroup {
	key: string;
	label: string;
	stablecoinSlug: string;
	weekTotals: Map<string, number>;
}

interface DisplayProtocolGroup {
	key: string;
	label: string;
	protocolSlug: string;
	weekTotals: Map<string, number>;
}

interface PreparedHistoricalRows {
	weeks: string[];
	filledRows: Array<HistoricalWeeklyVaultRow & { metadata?: HistoricalVaultMetadata }>;
	meta: HistoricalTvlPayloadMeta;
}

function normaliseWeek(value: string | Date): string {
	const parsed = parseDate(value) ?? parseDate(String(value));
	if (!parsed) throw new Error(`Invalid week value: ${String(value)}`);
	return parsed.toISOString().slice(0, 10);
}

function startOfUtcWeek(value: Date): Date {
	const date = new Date(value);
	date.setUTCHours(0, 0, 0, 0);

	const day = date.getUTCDay();
	const diff = day === 0 ? -6 : 1 - day;
	date.setUTCDate(date.getUTCDate() + diff);

	return date;
}

function resolveDisplayChain(chainId: number, fallbackName?: string) {
	const chain = getChain(chainId);
	if (chain) {
		return {
			key: chain.slug,
			label: chain.name,
			chainId: chain.id
		};
	}

	return {
		key: `chain-${chainId}`,
		label: fallbackName ?? `Chain ${chainId}`,
		chainId
	};
}

function resolveStablecoinGroup(metadata?: HistoricalVaultMetadata) {
	const stablecoinSlug =
		metadata?.denomination_slug?.trim() ||
		resolveStablecoinSlug({
			slug: metadata?.denomination_slug,
			symbol: metadata?.denomination,
			name: metadata?.normalised_denomination
		}) ||
		slugify(metadata?.denomination_slug ?? metadata?.denomination ?? metadata?.normalised_denomination ?? 'unknown');

	return {
		key: stablecoinSlug,
		label:
			metadata?.normalised_denomination ??
			formatStablecoinDisplayName(metadata?.normalised_denomination, metadata?.denomination) ??
			metadata?.denomination ??
			stablecoinSlug.toUpperCase(),
		stablecoinSlug
	};
}

function resolveProtocolGroup(metadata?: HistoricalVaultMetadata) {
	const protocolSlug = metadata?.protocol_slug?.trim() || slugify(metadata?.protocol ?? 'unknown') || 'unknown';
	return {
		key: protocolSlug,
		label: getProtocolDisplayName(metadata?.protocol) || protocolSlug,
		protocolSlug
	};
}

function createPayload<TSeries extends HistoricalTvlSeriesBase>(
	weeks: string[],
	series: TSeries[],
	meta: HistoricalTvlPayloadMeta,
	durationMs: number,
	generatedAt: Date
): HistoricalTvlPayload<TSeries> {
	return {
		generatedAt: generatedAt.toISOString(),
		durationMs: Math.round(durationMs),
		cacheTtlSeconds: HISTORICAL_TVL_CACHE_TTL_SECONDS,
		weeks,
		series,
		meta
	};
}

function prepareHistoricalRows(
	rows: HistoricalWeeklyVaultRow[],
	vaults: HistoricalVaultMetadata[]
): PreparedHistoricalRows {
	const metadataById = new Map(vaults.map((vault) => [vault.id, vault]));
	const includedVaultIds = new Set(vaults.filter((vault) => vault.risk_numeric !== 999).map((vault) => vault.id));
	const blacklistedVaultIds = new Set(vaults.filter((vault) => vault.risk_numeric === 999).map((vault) => vault.id));

	const includedIds = new Set<string>();
	const excludedBlacklistedIds = new Set<string>();
	const includedRows: HistoricalWeeklyVaultRow[] = [];
	let excludedOutlierPoints = 0;

	for (const row of rows) {
		if (!Number.isFinite(row.tvl) || row.tvl < 0) continue;

		if (row.tvl > HISTORICAL_TVL_OUTLIER_THRESHOLD) {
			excludedOutlierPoints += 1;
			continue;
		}

		if (!includedVaultIds.has(row.id)) {
			if (blacklistedVaultIds.has(row.id)) excludedBlacklistedIds.add(row.id);
			continue;
		}

		const metadata = metadataById.get(row.id);
		includedRows.push({
			id: row.id,
			chainId: metadata?.chain_id ?? row.chainId,
			week: normaliseWeek(row.week),
			tvl: row.tvl
		});
		includedIds.add(row.id);
	}

	const filledRows = forwardFillWeeklyRows(includedRows).map((row) => ({
		...row,
		metadata: metadataById.get(row.id)
	}));
	const weeks = [...new Set(filledRows.map((row) => normaliseWeek(row.week)))].toSorted((left, right) =>
		left.localeCompare(right)
	);

	return {
		weeks,
		filledRows,
		meta: {
			rawWeeklyVaultPoints: rows.length,
			includedVaults: includedIds.size,
			excludedBlacklistedVaults: excludedBlacklistedIds.size,
			excludedOutlierPoints
		}
	};
}

export function collapseVaultSnapshotsToWeeklyRows(rows: HistoricalVaultSnapshotRow[]): HistoricalWeeklyVaultRow[] {
	const weeklyRows = new Map<string, HistoricalWeeklyVaultRow & { latestTimestampMs: number }>();

	for (const row of rows) {
		const timestamp = parseDate(row.timestamp);
		if (!timestamp || !Number.isFinite(row.tvl)) continue;

		const week = startOfUtcWeek(timestamp).toISOString().slice(0, 10);
		const key = `${row.id}::${week}`;
		const timestampMs = timestamp.getTime();
		const existing = weeklyRows.get(key);

		if (!existing || timestampMs > existing.latestTimestampMs) {
			weeklyRows.set(key, {
				id: row.id,
				chainId: row.chainId,
				week,
				tvl: row.tvl,
				latestTimestampMs: timestampMs
			});
		}
	}

	return [...weeklyRows.values()]
		.map(({ latestTimestampMs: _latestTimestampMs, ...row }) => row)
		.toSorted(
			(left, right) =>
				normaliseWeek(left.week).localeCompare(normaliseWeek(right.week)) ||
				left.chainId - right.chainId ||
				left.id.localeCompare(right.id)
		);
}

export function forwardFillWeeklyRows(rows: HistoricalWeeklyVaultRow[]): HistoricalWeeklyVaultRow[] {
	const normalisedRows = rows
		.map((row) => ({
			...row,
			week: normaliseWeek(row.week)
		}))
		.toSorted(
			(left, right) =>
				left.id.localeCompare(right.id) ||
				left.chainId - right.chainId ||
				String(left.week).localeCompare(String(right.week))
		);

	const allWeeks = [...new Set(normalisedRows.map((row) => String(row.week)))].toSorted((left, right) =>
		left.localeCompare(right)
	);
	if (allWeeks.length === 0) return [];

	const weekIndex = new Map(allWeeks.map((week, index) => [week, index]));
	const rowsByVault = new Map<string, HistoricalWeeklyVaultRow[]>();

	for (const row of normalisedRows) {
		const key = `${row.id}::${row.chainId}`;
		const group = rowsByVault.get(key) ?? [];
		group.push(row);
		rowsByVault.set(key, group);
	}

	const filledRows: HistoricalWeeklyVaultRow[] = [];

	for (const vaultRows of rowsByVault.values()) {
		const firstWeekIndex = weekIndex.get(String(vaultRows[0].week));
		if (firstWeekIndex === undefined) continue;
		const rowsByWeek = new Map(vaultRows.map((row) => [String(row.week), row]));
		let lastSeenTvl: number | null = null;

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

	return filledRows.toSorted(
		(left, right) =>
			String(left.week).localeCompare(String(right.week)) ||
			left.chainId - right.chainId ||
			left.id.localeCompare(right.id)
	);
}

export function buildHistoricalTvlByChainPayload(
	rows: HistoricalWeeklyVaultRow[],
	vaults: HistoricalVaultMetadata[],
	durationMs: number,
	generatedAt = new Date()
): HistoricalTvlByChainPayload {
	const prepared = prepareHistoricalRows(rows, vaults);
	const groups = new Map<string, DisplayChainGroup>();

	for (const row of prepared.filledRows) {
		const week = normaliseWeek(row.week);
		const displayChain = resolveDisplayChain(row.chainId, row.metadata?.chain ?? undefined);
		const group = groups.get(displayChain.key) ?? {
			key: displayChain.key,
			label: displayChain.label,
			chainIds: new Set<number>(),
			weekTotals: new Map<string, number>()
		};

		group.chainIds.add(displayChain.chainId);
		group.weekTotals.set(week, (group.weekTotals.get(week) ?? 0) + row.tvl);
		groups.set(displayChain.key, group);
	}

	const latestWeekIndex = prepared.weeks.length - 1;
	const series = [...groups.values()]
		.map((group) => ({
			key: group.key,
			label: group.label,
			chainIds: [...group.chainIds].toSorted((left, right) => left - right),
			values: prepared.weeks.map((week) => group.weekTotals.get(week) ?? 0)
		}))
		.toSorted((left, right) => {
			const leftLatest = latestWeekIndex >= 0 ? (left.values[latestWeekIndex] ?? 0) : 0;
			const rightLatest = latestWeekIndex >= 0 ? (right.values[latestWeekIndex] ?? 0) : 0;
			return rightLatest - leftLatest || left.label.localeCompare(right.label);
		});

	return createPayload(prepared.weeks, series, prepared.meta, durationMs, generatedAt);
}

export function buildHistoricalTvlByStablecoinPayload(
	rows: HistoricalWeeklyVaultRow[],
	vaults: HistoricalVaultMetadata[],
	durationMs: number,
	generatedAt = new Date()
): HistoricalTvlByStablecoinPayload {
	const prepared = prepareHistoricalRows(rows, vaults);
	const groups = new Map<string, DisplayStablecoinGroup>();

	for (const row of prepared.filledRows) {
		const week = normaliseWeek(row.week);
		const stablecoin = resolveStablecoinGroup(row.metadata);
		const group = groups.get(stablecoin.key) ?? {
			key: stablecoin.key,
			label: stablecoin.label,
			stablecoinSlug: stablecoin.stablecoinSlug,
			weekTotals: new Map<string, number>()
		};

		group.weekTotals.set(week, (group.weekTotals.get(week) ?? 0) + row.tvl);
		groups.set(stablecoin.key, group);
	}

	const latestWeekIndex = prepared.weeks.length - 1;
	const series = [...groups.values()]
		.map((group) => ({
			key: group.key,
			label: group.label,
			stablecoinSlug: group.stablecoinSlug,
			values: prepared.weeks.map((week) => group.weekTotals.get(week) ?? 0)
		}))
		.toSorted((left, right) => {
			const leftLatest = latestWeekIndex >= 0 ? (left.values[latestWeekIndex] ?? 0) : 0;
			const rightLatest = latestWeekIndex >= 0 ? (right.values[latestWeekIndex] ?? 0) : 0;
			return rightLatest - leftLatest || left.label.localeCompare(right.label);
		});

	return createPayload(prepared.weeks, series, prepared.meta, durationMs, generatedAt);
}

export function buildHistoricalTvlByProtocolPayload(
	rows: HistoricalWeeklyVaultRow[],
	vaults: HistoricalVaultMetadata[],
	durationMs: number,
	generatedAt = new Date()
): HistoricalTvlByProtocolPayload {
	const prepared = prepareHistoricalRows(rows, vaults);
	const groups = new Map<string, DisplayProtocolGroup>();

	for (const row of prepared.filledRows) {
		const week = normaliseWeek(row.week);
		const protocol = resolveProtocolGroup(row.metadata);
		const group = groups.get(protocol.key) ?? {
			key: protocol.key,
			label: protocol.label,
			protocolSlug: protocol.protocolSlug,
			weekTotals: new Map<string, number>()
		};

		group.weekTotals.set(week, (group.weekTotals.get(week) ?? 0) + row.tvl);
		groups.set(protocol.key, group);
	}

	const latestWeekIndex = prepared.weeks.length - 1;
	const series = [...groups.values()]
		.map((group) => ({
			key: group.key,
			label: group.label,
			protocolSlug: group.protocolSlug,
			values: prepared.weeks.map((week) => group.weekTotals.get(week) ?? 0)
		}))
		.toSorted((left, right) => {
			const leftLatest = latestWeekIndex >= 0 ? (left.values[latestWeekIndex] ?? 0) : 0;
			const rightLatest = latestWeekIndex >= 0 ? (right.values[latestWeekIndex] ?? 0) : 0;
			return rightLatest - leftLatest || left.label.localeCompare(right.label);
		});

	return createPayload(prepared.weeks, series, prepared.meta, durationMs, generatedAt);
}
