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
}

export type { TimeBucket, Periodicity };

/**
 * Convert period and interval params provided in ChartIQ quotefeed fetch
 * methods to Trading Strategy standard TimeBucket
 */
export function feedParamsToTimeBucket(duration: number, timeUnit: TimeUnit): TimeBucket {
  switch (timeUnit) {
    case 'minute' : return duration % 60 === 0 ? `${duration / 60}h` : `${duration}m`;
    case 'day'    : return `${duration}d`;
    case 'week'   : return `${duration * 7}d`;
    case 'month'  : return `${duration * 30}d`;
  }
}


function getFullTimeUnit(abbrev: string): TimeUnit {
  switch (abbrev) {
    case 'm' : return 'minute';
    case 'h' : return 'hour';
    case 'd' : return 'day';
  }
}

function daysToWeeksOrMonths(duration: number): [number, TimeUnit] {
  switch (duration) {
    case 7  : return [1, 'week'];
    case 30 : return [1, 'month'];
    default : return [duration, 'day'];
  }
}

/**
 * Convert Trading Strategy standard TimeBucket to ChartIQ periodicity object
 * expected by ChartIQ engine constructor
 */
export function timeBucketToPeriodicity(bucket: TimeBucket): Periodicity {
  const [, durationStr, timeUnitAbbrev ] = bucket.match(/^(\d+)(\w)$/);
  let interval = Number.parseInt(durationStr, 10);
  let timeUnit = getFullTimeUnit(timeUnitAbbrev);

  if (timeUnit === 'day') {
    [interval, timeUnit] = daysToWeeksOrMonths(interval);
  }

  return { period: 1, interval, timeUnit };
}
