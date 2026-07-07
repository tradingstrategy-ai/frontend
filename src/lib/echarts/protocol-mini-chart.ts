import { parseDate } from '$lib/helpers/date';
import { annualizedReturn } from '$lib/helpers/financial';
import { VAULT_TVL_OUTLIER_THRESHOLD } from './tvl-outliers';

const LOOKBACK_DAYS = 30;
const LOOKBACK_MS = LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
const MAX_APY_THRESHOLD = 10;
export const PROTOCOL_MINI_CHART_TVL_OUTLIER_THRESHOLD = VAULT_TVL_OUTLIER_THRESHOLD;

export interface ProtocolMiniChartDailyRow {
	id: string;
	day: string | Date;
	tvl: number;
	sharePrice: number | null;
}

export interface ProtocolMiniChartLatestApyRow {
	id: string;
	tvl: number;
	apy: number | null;
}

export interface ProtocolMiniChartPoint {
	date: string;
	tvl: number;
	apy: number | null;
}

export interface ProtocolMiniChartPayload {
	generatedAt: string;
	cacheTtlSeconds: number;
	points: ProtocolMiniChartPoint[];
	meta: {
		vaultCount: number;
		rawDailyVaultPoints: number;
		excludedOutlierPoints: number;
		pointsWithApy: number;
	};
}

interface NormalisedDailyRow {
	id: string;
	day: string;
	tvl: number;
	sharePrice: number | null;
}

interface FilledVaultPoint {
	day: string;
	dayMs: number;
	tvl: number;
	sharePrice: number | null;
}

interface ProtocolMiniChartOptions {
	generatedAt?: Date;
	latestApyRows?: ProtocolMiniChartLatestApyRow[];
}

function normaliseDay(value: string | Date) {
	const parsed = parseDate(value) ?? parseDate(String(value));
	if (!parsed) return null;
	return parsed.toISOString().slice(0, 10);
}

function getPointAtOrBefore(points: FilledVaultPoint[], dayMs: number) {
	let low = 0;
	let high = points.length - 1;
	let match: FilledVaultPoint | undefined;

	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const point = points[mid];

		if (point.dayMs <= dayMs) {
			match = point;
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}

	return match;
}

function buildFilledVaultSeries(rows: NormalisedDailyRow[], allDays: string[]) {
	const rowsByDay = new Map(rows.map((row) => [row.day, row]));
	const firstDay = rows[0]?.day;
	if (!firstDay) return [];

	const firstDayIndex = allDays.indexOf(firstDay);
	const filled: FilledVaultPoint[] = [];
	let lastTvl: number | null = null;
	let lastSharePrice: number | null = null;

	for (let index = Math.max(firstDayIndex, 0); index < allDays.length; index += 1) {
		const day = allDays[index];
		const row = rowsByDay.get(day);

		if (row) {
			lastTvl = row.tvl;
			if (row.sharePrice != null) {
				lastSharePrice = row.sharePrice;
			}
		}

		if (lastTvl == null) continue;

		filled.push({
			day,
			dayMs: Date.parse(`${day}T00:00:00Z`),
			tvl: lastTvl,
			sharePrice: lastSharePrice
		});
	}

	return filled;
}

function resolveOptions(optionsOrGeneratedAt?: Date | ProtocolMiniChartOptions): Required<ProtocolMiniChartOptions> {
	if (optionsOrGeneratedAt instanceof Date) {
		return { generatedAt: optionsOrGeneratedAt, latestApyRows: [] };
	}

	return {
		generatedAt: optionsOrGeneratedAt?.generatedAt ?? new Date(),
		latestApyRows: optionsOrGeneratedAt?.latestApyRows ?? []
	};
}

function getLatestApyOverride(rows: ProtocolMiniChartLatestApyRow[]) {
	let weightedSum = 0;
	let weight = 0;

	for (const row of rows) {
		if (!Number.isFinite(row.tvl) || row.tvl <= 0) continue;
		if (row.apy == null || !Number.isFinite(row.apy) || row.apy > MAX_APY_THRESHOLD) continue;

		weightedSum += row.tvl * row.apy;
		weight += row.tvl;
	}

	return weight > 0 ? weightedSum / weight : null;
}

export function buildProtocolMiniChartPayload(
	rows: ProtocolMiniChartDailyRow[],
	vaultCount: number,
	cacheTtlSeconds: number,
	optionsOrGeneratedAt?: Date | ProtocolMiniChartOptions
): ProtocolMiniChartPayload {
	const { generatedAt, latestApyRows } = resolveOptions(optionsOrGeneratedAt);
	let excludedOutlierPoints = 0;
	const normalisedRows = rows
		.map((row): NormalisedDailyRow | null => {
			const day = normaliseDay(row.day);
			if (
				!day ||
				!Number.isFinite(row.tvl) ||
				row.tvl < 0 ||
				(row.sharePrice != null && !Number.isFinite(row.sharePrice))
			) {
				return null;
			}

			if (row.tvl > PROTOCOL_MINI_CHART_TVL_OUTLIER_THRESHOLD) {
				excludedOutlierPoints += 1;
				return null;
			}

			return {
				id: row.id,
				day,
				tvl: row.tvl,
				sharePrice: row.sharePrice != null && row.sharePrice > 0 ? row.sharePrice : null
			};
		})
		.filter((row): row is NormalisedDailyRow => row !== null)
		.toSorted((left, right) => left.id.localeCompare(right.id) || left.day.localeCompare(right.day));

	const allDays = [...new Set(normalisedRows.map((row) => row.day))].toSorted((left, right) =>
		left.localeCompare(right)
	);
	const rowsByVault = new Map<string, NormalisedDailyRow[]>();

	for (const row of normalisedRows) {
		const vaultRows = rowsByVault.get(row.id) ?? [];
		vaultRows.push(row);
		rowsByVault.set(row.id, vaultRows);
	}

	const filledVaultSeries = [...rowsByVault.values()].map((vaultRows) => buildFilledVaultSeries(vaultRows, allDays));
	const points: ProtocolMiniChartPoint[] = allDays.map((day) => {
		const dayMs = Date.parse(`${day}T00:00:00Z`);
		let tvl = 0;
		let apyWeightedSum = 0;
		let apyWeight = 0;

		for (const vaultPoints of filledVaultSeries) {
			const current = getPointAtOrBefore(vaultPoints, dayMs);
			if (!current || current.day !== day) continue;

			tvl += current.tvl;

			const lookback = getPointAtOrBefore(vaultPoints, dayMs - LOOKBACK_MS);
			if (
				!lookback ||
				lookback.sharePrice == null ||
				current.sharePrice == null ||
				lookback.sharePrice <= 0 ||
				current.sharePrice <= 0 ||
				current.dayMs <= lookback.dayMs
			)
				continue;

			const returnRate = current.sharePrice / lookback.sharePrice - 1;
			if (returnRate <= -1) continue;

			const apy = annualizedReturn(new Date(lookback.dayMs), new Date(current.dayMs), returnRate);

			if (apy == null || !Number.isFinite(apy) || apy > MAX_APY_THRESHOLD) continue;

			apyWeightedSum += current.tvl * apy;
			apyWeight += current.tvl;
		}

		return {
			date: day,
			tvl,
			apy: apyWeight > 0 ? apyWeightedSum / apyWeight : null
		};
	});
	const latestApyOverride = getLatestApyOverride(latestApyRows);
	if (latestApyOverride != null && points.length > 0) {
		points[points.length - 1] = { ...points[points.length - 1], apy: latestApyOverride };
	}

	return {
		generatedAt: generatedAt.toISOString(),
		cacheTtlSeconds,
		points,
		meta: {
			vaultCount,
			rawDailyVaultPoints: rows.length,
			excludedOutlierPoints,
			pointsWithApy: points.filter((point) => point.apy != null).length
		}
	};
}
