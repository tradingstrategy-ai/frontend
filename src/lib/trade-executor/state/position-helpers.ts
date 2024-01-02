import type { PositionStatistics } from './statistics';

type Maybe<Value> = Value | null | undefined;

/**
 * Get position value at the open in US dollar
 *
 */
export function getValueAtOpen(stats: Maybe<PositionStatistics[]>): number | undefined {
	return stats?.[0]?.value;
}

/**
 * Get position value before it was closed
 *
 */
export function getValueAtClose(stats: Maybe<PositionStatistics[]>): number | undefined {
	// At -1 we have updated the position value after close, it is zero if it was properly closed
	// At -2 we have the last valuation before performing the closing
	return stats?.at(-2)?.value;
}

/**
 * Get position value at its peak as US dollar
 *
 */
export function getValueAtPeak(stats: Maybe<PositionStatistics[]>): number | undefined {
	if (!stats || stats.length === 0) return undefined;
	const maxValue = Math.max(...stats.map((s) => s.value));
	return Number.isFinite(maxValue) ? maxValue : undefined;
}
