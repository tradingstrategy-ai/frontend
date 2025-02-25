import { utcHour } from 'd3-time';

type CycleUnit = 'h' | 'd';
export type CycleDuration = `${number}${CycleUnit}`;

/**
 * Get next expected cycle time based on a cycle duration string and offset minutes.
 *
 * @param cycleDuration duration and units, e.g.: "4h", "1d" (only hours and days supported)
 * @param offsetMinutes number of minutes offset to add to the next cycle time (optional)
 * @returns the next cycle time or undefined if the duration couldn't be parsed
 */
export function getNextExpectedCycleTime(cycleDuration: CycleDuration, offsetMinutes = 0): Date | undefined {
	const hours = cycleDurationToHours(cycleDuration);
	if (!hours) return undefined;

	const nextCycleTime = utcHour.every(hours)!.ceil(new Date());
	nextCycleTime.setUTCMinutes(offsetMinutes);
	return nextCycleTime;
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
