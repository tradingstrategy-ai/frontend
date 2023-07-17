/**
 * Utility functions to convert between time bucket formats
 */

type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month';
type TimeUnitAbbrev = 'm' | 'h' | 'd'; // no shorthands for week or month
type TimeBucket = `${number}${TimeUnitAbbrev}`;
type Periodicity = {
	period: number;
	interval: number;
	timeUnit: TimeUnit;
};

export type { TimeBucket, Periodicity };

/**
 * Convert ChartIQ periodicity object to Trading Strategy TimeBucket
 */
export function periodicityToTimeBucket({ period, interval, timeUnit }: Periodicity): TimeBucket {
	switch (timeUnit) {
		case 'minute':
			return interval === 60 ? `${period}h` : `${interval}m`;
		case 'day':
			return `${interval}d`;
		case 'week':
			return `${interval * 7}d`;
		case 'month':
			return `${interval * 30}d`;
	}
}

/**
 * Convert Trading Strategy TimeBucket to ChartIQ periodicity object
 */
export function timeBucketToPeriodicity(bucket: TimeBucket): Periodicity {
	const [, durationStr, timeUnitAbbrev] = bucket.match(/^(\d+)(\w)$/);
	const duration = Number.parseInt(durationStr, 10);

	switch (timeUnitAbbrev) {
		case 'm':
			return { period: 1, interval: duration, timeUnit: 'minute' };
		case 'h':
			return { period: duration, interval: 60, timeUnit: 'minute' };
		case 'd':
			return interDayPeriodicity(duration);
	}
}

function interDayPeriodicity(days: number): Periodicity {
	switch (days) {
		case 7:
			return { period: 1, interval: 1, timeUnit: 'week' };
		case 30:
			return { period: 1, interval: 1, timeUnit: 'month' };
		default:
			return { period: 1, interval: days, timeUnit: 'day' };
	}
}
