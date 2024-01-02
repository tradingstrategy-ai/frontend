import type { PositionStatistics } from './statistics';
import { describe, test, expect } from 'vitest';
import { getValueAtOpen, getValueAtClose, getValueAtPeak } from './position-helpers';

describe('getValueAtOpen', () => {
	test('should return value of first stats element', () => {
		const stats = [{ value: 100 }, { value: 200 }] as PositionStatistics[];
		expect(getValueAtOpen(stats)).toBe(100);
	});

	test('should return undefined for empty stats array', () => {
		expect(getValueAtOpen([])).toBeUndefined();
	});

	test('should return undefined for stats with no value', () => {
		const stat = {} as PositionStatistics;
		expect(getValueAtOpen([stat])).toBeUndefined();
	});

	test('should return undefined for null or undefined stats', () => {
		expect(getValueAtOpen(null)).toBeUndefined();
		expect(getValueAtOpen(undefined)).toBeUndefined();
	});
});

describe('getValueAtClose', () => {
	test('should return value of second-to-last stats element', () => {
		const stats = [{ value: 100 }, { value: 200 }, { value: 0 }] as PositionStatistics[];
		expect(getValueAtClose(stats)).toBe(200);
	});

	test('should return undefined if stats has less than 2 elements', () => {
		const stats = [{ value: 100 }] as PositionStatistics[];
		expect(getValueAtClose(stats)).toBeUndefined();
	});

	test('should return undefined for empty stats array', () => {
		expect(getValueAtClose([])).toBeUndefined();
	});

	test('should return undefined for stats with no value', () => {
		const stat = {} as PositionStatistics;
		expect(getValueAtClose([stat])).toBeUndefined();
	});

	test('should return undefined for null or undefined stats', () => {
		expect(getValueAtClose(null)).toBeUndefined();
		expect(getValueAtClose(undefined)).toBeUndefined();
	});
});

describe('getValueAtPeak', () => {
	test('should return max value of stats elements', () => {
		const stats = [{ value: 100 }, { value: 200 }, { value: 150 }] as PositionStatistics[];
		expect(getValueAtPeak(stats)).toBe(200);
	});

	test('should return undefined for empty stats array', () => {
		expect(getValueAtPeak([])).toBeUndefined();
	});

	test('should return undefined for stats with no value', () => {
		const stat = {} as PositionStatistics;
		expect(getValueAtPeak([stat])).toBeUndefined();
	});

	test('should return undefined for null or undefined stats', () => {
		expect(getValueAtPeak(null)).toBeUndefined();
		expect(getValueAtPeak(undefined)).toBeUndefined();
	});
});
