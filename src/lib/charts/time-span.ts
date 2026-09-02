import type { TimeSpan } from './types';
import { timeBucketToInterval } from './helpers';

const timeSpans = {
	'1W': {
		performanceLabel: 'past week',
		spanDays: 7,
		timeBucket: '1h'
	},
	'1M': {
		performanceLabel: 'past month',
		spanDays: 30,
		timeBucket: '4h'
	},
	'3M': {
		performanceLabel: 'past 90 days',
		spanDays: 90,
		timeBucket: '1d'
	},
	'6M': {
		performanceLabel: 'past 6 months',
		spanDays: 180,
		timeBucket: '1d'
	},
	'1Y': {
		performanceLabel: 'past year',
		spanDays: 365,
		timeBucket: '1d'
	},
	Max: {
		performanceLabel: 'lifetime',
		timeBucket: '1d'
	}
} as const;

export type TimeSpanKey = keyof typeof timeSpans;

const defaultTimeSpanKeys = ['1W', '1M', '3M', 'Max'] as const satisfies readonly TimeSpanKey[];

export const TimeSpans = {
	get keys() {
		return Object.keys(timeSpans) as TimeSpanKey[];
	},

	get defaultKeys(): readonly TimeSpanKey[] {
		return defaultTimeSpanKeys;
	},

	get(key: TimeSpanKey): TimeSpan {
		const timeSpan = timeSpans[key];
		return {
			...timeSpan,
			interval: timeBucketToInterval(timeSpan.timeBucket)
		};
	}
};
