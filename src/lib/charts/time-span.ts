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
	Max: {
		performanceLabel: 'lifetime',
		timeBucket: '1d'
	}
} as const;

type TimeSpanKey = keyof typeof timeSpans;

export const TimeSpans = {
	get keys() {
		return Object.keys(timeSpans) as TimeSpanKey[];
	},

	get(key: TimeSpanKey): TimeSpan {
		const timeSpan = timeSpans[key];
		return {
			...timeSpan,
			interval: timeBucketToInterval(timeSpan.timeBucket)
		};
	}
};
