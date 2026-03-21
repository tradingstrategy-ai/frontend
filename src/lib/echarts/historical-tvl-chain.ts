import { getChain } from '$lib/helpers/chain';
import { parseDate } from '$lib/helpers/date';
import type { VaultInfo } from '$lib/top-vaults/schemas';

export const HISTORICAL_TVL_CHAIN_OUTLIER_THRESHOLD = 50_000_000_000;
export const HISTORICAL_TVL_CHAIN_CACHE_TTL_SECONDS = 24 * 60 * 60;

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

export interface HistoricalTvlByChainSeries {
	key: string;
	label: string;
	chainIds: number[];
	values: number[];
}

export interface HistoricalTvlByChainPayload {
	generatedAt: string;
	durationMs: number;
	cacheTtlSeconds: number;
	weeks: string[];
	series: HistoricalTvlByChainSeries[];
	meta: {
		rawWeeklyVaultPoints: number;
		includedVaults: number;
		excludedBlacklistedVaults: number;
		excludedOutlierPoints: number;
	};
}

type HistoricalVaultMetadata = Pick<VaultInfo, 'id' | 'risk_numeric' | 'chain_id' | 'chain'>;

interface DisplayChainGroup {
	key: string;
	label: string;
	chainIds: Set<number>;
	weekTotals: Map<string, number>;
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
	const metadataById = new Map(vaults.map((vault) => [vault.id, vault]));
	const includedVaultIds = new Set(vaults.filter((vault) => vault.risk_numeric !== 999).map((vault) => vault.id));
	const blacklistedVaultIds = new Set(vaults.filter((vault) => vault.risk_numeric === 999).map((vault) => vault.id));

	const weeks = new Set<string>();
	const includedIds = new Set<string>();
	const excludedBlacklistedIds = new Set<string>();
	const groups = new Map<string, DisplayChainGroup>();
	const includedRows: HistoricalWeeklyVaultRow[] = [];

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
		const week = normaliseWeek(row.week);
		includedRows.push({
			id: row.id,
			chainId,
			week,
			tvl: row.tvl
		});
		includedIds.add(row.id);
	}

	for (const row of forwardFillWeeklyRows(includedRows)) {
		const metadata = metadataById.get(row.id);
		const week = normaliseWeek(row.week);
		const displayChain = resolveDisplayChain(row.chainId, metadata?.chain ?? undefined);

		const group = groups.get(displayChain.key) ?? {
			key: displayChain.key,
			label: displayChain.label,
			chainIds: new Set<number>(),
			weekTotals: new Map<string, number>()
		};

		group.chainIds.add(displayChain.chainId);
		group.weekTotals.set(week, (group.weekTotals.get(week) ?? 0) + row.tvl);

		groups.set(displayChain.key, group);
		weeks.add(week);
	}

	const sortedWeeks = [...weeks].toSorted((left, right) => left.localeCompare(right));
	const latestWeek = sortedWeeks.at(-1);

	const series = [...groups.values()]
		.map((group) => ({
			key: group.key,
			label: group.label,
			chainIds: [...group.chainIds].toSorted((left, right) => left - right),
			values: sortedWeeks.map((week) => group.weekTotals.get(week) ?? 0)
		}))
		.toSorted((left, right) => {
			const leftLatest = latestWeek ? (left.values[sortedWeeks.indexOf(latestWeek)] ?? 0) : 0;
			const rightLatest = latestWeek ? (right.values[sortedWeeks.indexOf(latestWeek)] ?? 0) : 0;
			return rightLatest - leftLatest || left.label.localeCompare(right.label);
		});

	return {
		generatedAt: generatedAt.toISOString(),
		durationMs: Math.round(durationMs),
		cacheTtlSeconds: HISTORICAL_TVL_CHAIN_CACHE_TTL_SECONDS,
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
