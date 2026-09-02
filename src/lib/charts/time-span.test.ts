import { describe, expect, test } from 'vitest';
import { TimeSpans } from './time-span';

describe('TimeSpans', () => {
	test('provides long comparison ranges without changing chart defaults', () => {
		expect(TimeSpans.get('6M')).toMatchObject({ spanDays: 180, timeBucket: '1d' });
		expect(TimeSpans.get('1Y')).toMatchObject({ spanDays: 365, timeBucket: '1d' });
		expect(TimeSpans.defaultKeys).toEqual(['1W', '1M', '3M', 'Max']);
	});
});
