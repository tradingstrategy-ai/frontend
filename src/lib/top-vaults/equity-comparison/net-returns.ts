import { getDataRange, resampleTimeSeries } from '$lib/charts/helpers';
import type { TimeSpan } from '$lib/charts/types';
import { annualizedReturn } from '$lib/helpers/financial';
import type { VaultInfo } from '$lib/top-vaults/schemas';
import type {
	ComparisonChartPoint,
	ComparisonFeeProfile,
	ComparisonPeriodMetrics,
	ComparisonReturnMode
} from './types';

const SECONDS_PER_YEAR = 365.25 * 86_400;

/** Return a normalised investor fee profile when enough data exists for a net curve. */
export function getComparisonFeeProfile(vault: Pick<VaultInfo, 'net_fees'>): ComparisonFeeProfile | null {
	const fees = vault.net_fees;
	const feeMode = fees?.fee_mode;
	if (!fees || !feeMode) return null;

	if (feeMode === 'feeless') {
		return {
			entryRate: 0,
			exitRate: 0,
			managementRate: 0,
			performanceRate: 0
		};
	}

	if (!isTransactionRate(fees.deposit) || !isTransactionRate(fees.withdraw)) return null;

	// `net_fees` is the investor schedule used for this calculation. Do not let
	// a conflicting legacy or gross-fee flag change its collection semantics.
	const internalised = feeMode.startsWith('internalised');
	if (internalised) {
		return {
			entryRate: fees.deposit,
			exitRate: fees.withdraw,
			managementRate: 0,
			performanceRate: 0
		};
	}

	if (!isRate(fees.management) || !isRate(fees.performance)) return null;
	return {
		entryRate: fees.deposit,
		exitRate: fees.withdraw,
		managementRate: fees.management,
		performanceRate: fees.performance
	};
}

/** Resolve the only return mode that is valid for a selected vault set. */
export function getCanonicalComparisonReturnMode(
	requestedMode: ComparisonReturnMode,
	selectedVaults: readonly Pick<VaultInfo, 'net_fees'>[]
): ComparisonReturnMode {
	if (selectedVaults.length === 0) return 'net';
	if (requestedMode === 'gross') return 'gross';
	return selectedVaults.every((vault) => getComparisonFeeProfile(vault) !== null) ? 'net' : 'gross';
}

/** Get the exact visible numeric range used by the shared chart shell. */
export function getComparisonVisibleRange(
	range: [number, number] | null | undefined,
	timeSpan: TimeSpan
): [number, number] | null {
	if (!range) return null;
	const rangeDriver = resampleTimeSeries(
		[
			[range[0], 100],
			[range[1], 100]
		],
		timeSpan.interval
	);
	const visible = getDataRange(rangeDriver, timeSpan);
	return visible ? [visible[0].getTime() / 1_000, visible[1].getTime() / 1_000] : null;
}

/**
 * Convert a gross indexed series to a fee-adjusted net liquidation-value curve.
 *
 * The first point is deliberately pre-entry. The final point is post-exit, so
 * one-time transaction fees remain visible and are included in the CAGR.
 */
export function getNetComparisonPoints(
	points: readonly ComparisonChartPoint[],
	feeProfile: ComparisonFeeProfile,
	visibleRange: [number, number] | null
): ComparisonChartPoint[] {
	if (!visibleRange) return [];
	const visible = points.filter(({ time }) => time >= visibleRange[0] && time <= visibleRange[1]);
	if (!visible.length) return [];
	if (isZeroFeeProfile(feeProfile)) return visible.map((point) => ({ ...point }));

	const start = visible[0];
	const end = visible.at(-1)!;
	const startingValue = start.value;
	if (!Number.isFinite(startingValue) || startingValue <= 0) return [];
	if (visible.length === 1) {
		return [
			{
				time: start.time,
				value: startingValue * (1 - feeProfile.entryRate) * (1 - feeProfile.exitRate),
				feeEvent: feeProfile.exitRate > 0 ? 'after-exit' : feeProfile.entryRate > 0 ? 'after-entry' : undefined
			}
		];
	}

	const netValueBeforeExit = (point: ComparisonChartPoint): number => {
		const invested = startingValue * (1 - feeProfile.entryRate);
		const grossValue = invested * (point.value / startingValue);
		const elapsedYears = Math.max(0, point.time - start.time) / SECONDS_PER_YEAR;
		const managementFee = invested * feeProfile.managementRate * elapsedYears;
		const profitAfterManagement = Math.max(0, grossValue - invested - managementFee);
		const performanceFee = feeProfile.performanceRate * profitAfterManagement;
		return Math.max(0, grossValue - managementFee - performanceFee);
	};

	const entryOffset = getEntryOffset(start.time, visible[1].time - start.time);
	const netPoints: ComparisonChartPoint[] = visible.map((point, index) => ({
		time: point.time,
		value: index === 0 && feeProfile.entryRate > 0 && entryOffset !== null ? startingValue : netValueBeforeExit(point)
	}));
	if (feeProfile.entryRate > 0 && entryOffset !== null) {
		netPoints.splice(1, 0, {
			time: start.time + entryOffset,
			value: netValueBeforeExit(start),
			feeEvent: 'after-entry'
		});
	} else if (feeProfile.entryRate > 0) {
		netPoints[0].feeEvent = 'after-entry';
	}

	const exitOffset = getBoundaryOffset(end.time - visible[visible.length - 2].time);
	if (feeProfile.exitRate > 0) {
		netPoints.pop();
		const beforeExit = netValueBeforeExit(end);
		if (exitOffset !== null) {
			netPoints.push({ time: end.time - exitOffset, value: beforeExit, feeEvent: 'before-exit' });
		}
		netPoints.push({
			time: end.time,
			value: Math.max(0, beforeExit * (1 - feeProfile.exitRate)),
			feeEvent: 'after-exit'
		});
	}

	return netPoints;
}

/** Calculate visible net CAGR and the first observed date for a selected vault. */
export function getNetComparisonPeriodMetrics(
	points: readonly ComparisonChartPoint[],
	feeProfile: ComparisonFeeProfile,
	visibleRange: [number, number] | null
): ComparisonPeriodMetrics {
	const visible = visibleRange ? points.filter(({ time }) => time >= visibleRange[0] && time <= visibleRange[1]) : [];
	const netPoints = getNetComparisonPoints(points, feeProfile, visibleRange);
	const first = visible[0];
	const last = netPoints.at(-1);
	let cagr: number | null = null;

	if (first && last && last.time > first.time && first.value > 0 && last.value >= 0) {
		const annualised = annualizedReturn(
			new Date(first.time * 1_000),
			new Date(last.time * 1_000),
			last.value / first.value - 1
		);
		if (annualised !== undefined && Number.isFinite(annualised)) cagr = annualised;
	}

	return {
		cagr,
		since: visible[0] ? new Date(visible[0].time * 1_000).toISOString().slice(0, 10) : null
	};
}

function isRate(value: number | null): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isTransactionRate(value: number | null): value is number {
	return isRate(value) && value < 1;
}

function getBoundaryOffset(gap: number): number | null {
	const offset = Math.min(3_600, Math.floor(gap / 4));
	return offset >= 1 ? offset : null;
}

function getEntryOffset(start: number, gap: number): number | null {
	const secondsRemainingInDay = 86_399 - (((start % 86_400) + 86_400) % 86_400);
	return getBoundaryOffset(Math.min(gap, secondsRemainingInDay * 4));
}

function isZeroFeeProfile(feeProfile: ComparisonFeeProfile): boolean {
	return (
		feeProfile.entryRate === 0 &&
		feeProfile.exitRate === 0 &&
		feeProfile.managementRate === 0 &&
		feeProfile.performanceRate === 0
	);
}
