import { utcHour } from 'd3-time';
import { addMinutes } from 'date-fns';

type CycleUnit = 'h' | 'd';
export type CycleDuration = `${number}${CycleUnit}`;

/**
 * Get next expected cycle time based on a cycle duration string and offset minutes.
 *
 * @param cycleDuration duration and units, e.g.: "4h", "1d" (only hours and days supported)
 * @param offset minutes to offset the cycle time from the top of the hour
 * @returns the next cycle time or undefined if the duration couldn't be parsed
 */
export function getNextExpectedCycleTime(cycleDuration: CycleDuration, offset = 0): Date | undefined {
	const hours = cycleDurationToHours(cycleDuration);
	if (!hours) return undefined;

	const interval = utcHour.every(hours)!;
	const now = new Date();
	const next = interval.ceil(addMinutes(now, -offset));
	return addMinutes(next, offset);
}

/**
 * Convert cycle duration string (e.g., "4h", "1d") to integer number of hours.
 *
 * @param cycleDuration duration and units, e.g.: "4h", "1d" (only hours and days supported)
 * @returns number of hours or undefined if the format is invalid
 */
export function cycleDurationToHours(cycleDuration: CycleDuration): number | undefined {
	const match = cycleDuration.match(/^(\d+)([hd])$/);
	if (!match) return undefined;

	const [, number, unit] = match;
	const duration = Number(number);
	return unit === 'd' ? duration * 24 : duration;
}
