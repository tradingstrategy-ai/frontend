import { describe, expect, it } from 'vitest';
import { isOlderThan, normaliseGeneratedAt } from './generated-at';

describe('generated_at helpers', () => {
	it('normalises string and Date timestamps to canonical ISO strings', () => {
		expect(normaliseGeneratedAt('2026-07-03T08:00:00Z')).toBe('2026-07-03T08:00:00.000Z');
		expect(normaliseGeneratedAt(new Date('2026-07-03T08:00:00Z'))).toBe('2026-07-03T08:00:00.000Z');
		expect(normaliseGeneratedAt(null)).toBeNull();
	});

	it('compares generated_at values by timestamp when both values are parseable', () => {
		expect(isOlderThan('2026-07-03T08:00:00Z', '2026-07-03T09:00:00.000Z')).toBe(true);
		expect(isOlderThan('2026-07-03T09:00:00Z', '2026-07-03T09:00:00.000Z')).toBe(false);
		expect(isOlderThan('2026-07-03T10:00:00Z', '2026-07-03T09:00:00.000Z')).toBe(false);
	});

	it('treats an absent expected timestamp as no minimum freshness requirement', () => {
		expect(isOlderThan('2026-07-03T08:00:00Z', null)).toBe(false);
	});
});
