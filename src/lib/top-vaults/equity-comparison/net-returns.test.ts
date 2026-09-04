import { describe, expect, test } from 'vitest';
import { TimeSpans } from '$lib/charts/time-span';
import { createTestVault } from '$lib/top-vaults/test-utils';
import {
	getCanonicalComparisonReturnMode,
	getComparisonFeeProfile,
	getComparisonVisibleRange,
	getNetComparisonPeriodMetrics,
	getNetComparisonPoints
} from './net-returns';

const day = 86_400;
const range: [number, number] = [0, 90 * day];
const points = [
	{ time: 0, value: 100 },
	{ time: 30 * day, value: 110 },
	{ time: 90 * day, value: 120 }
];

describe('comparison net fee profiles', () => {
	test('normalises explicit feeless schedules', () => {
		const profile = getComparisonFeeProfile(
			createTestVault('Feeless', {
				net_fees: { fee_mode: 'feeless', management: null, performance: null, deposit: null, withdraw: null }
			})
		);
		expect(profile).toMatchObject({ entryRate: 0, exitRate: 0, managementRate: 0, performanceRate: 0 });
	});

	test('requires every applicable externalised rate', () => {
		expect(
			getComparisonFeeProfile(
				createTestVault('Missing fee', {
					net_fees: { fee_mode: 'externalised', management: null, performance: 0.2, deposit: 0, withdraw: 0 }
				})
			)
		).toBeNull();
	});

	test.each([
		{ fee_mode: null, management: 0, performance: 0, deposit: 0, withdraw: 0 },
		{ fee_mode: 'externalised' as const, management: 0, performance: -0.1, deposit: 0, withdraw: 0 },
		{ fee_mode: 'externalised' as const, management: 0, performance: 0, deposit: 1, withdraw: 0 }
	])('rejects an unusable fee schedule: $fee_mode', (net_fees) => {
		expect(getComparisonFeeProfile(createTestVault('Invalid fee', { net_fees }))).toBeNull();
	});

	test('does not double deduct internalised management and performance fees', () => {
		const profile = getComparisonFeeProfile(
			createTestVault('Internalised', {
				fee_internalised: true,
				gross_fees: {
					fee_mode: 'internalised_minting',
					management: 0,
					performance: 0.3,
					deposit: 0.01,
					withdraw: 0
				},
				net_fees: {
					fee_mode: 'internalised_minting',
					management: 0.02,
					performance: 0.3,
					deposit: 0.01,
					withdraw: 0
				}
			})
		);
		expect(profile).toMatchObject({
			entryRate: 0.01,
			managementRate: 0,
			performanceRate: 0
		});
		const netCurve = getNetComparisonPoints(points, profile!, range);
		// Only the 1% entry fee applies; the 30% performance fee is already
		// embedded in the internalised share price.
		expect(netCurve.at(-1)?.value).toBeCloseTo(118.8);
	});

	test('uses the structured net-fee mode when legacy fee fields conflict', () => {
		const profile = getComparisonFeeProfile(
			createTestVault('Structured schedule wins', {
				fee_internalised: true,
				net_fees: { fee_mode: 'externalised', management: 0.02, performance: 0.2, deposit: 0, withdraw: 0 }
			})
		);
		expect(profile).toMatchObject({ managementRate: 0.02, performanceRate: 0.2 });
	});

	test('automatically falls back to Gross when a selected vault lacks fee information', () => {
		const complete = createTestVault('Complete', {
			net_fees: { fee_mode: 'externalised', management: 0, performance: 0, deposit: 0, withdraw: 0 }
		});
		const incomplete = createTestVault('Incomplete', {
			net_fees: { fee_mode: 'externalised', management: null, performance: 0, deposit: 0, withdraw: 0 }
		});
		expect(getCanonicalComparisonReturnMode('net', [complete])).toBe('net');
		expect(getCanonicalComparisonReturnMode('net', [complete, incomplete])).toBe('gross');
		expect(getCanonicalComparisonReturnMode('gross', [complete])).toBe('gross');
		expect(getCanonicalComparisonReturnMode('gross', [])).toBe('net');
	});
});

describe('net comparison curves', () => {
	test('uses second-based chart ranges and the shared time-span configuration', () => {
		const start = Date.UTC(2026, 0, 1) / 1_000;
		const end = start + 100 * day;
		expect(getComparisonVisibleRange([start, end], TimeSpans.get('1M'))).toEqual([end - 30 * day + 4 * 3_600, end]);
	});

	test('shows entry and exit fee dips at the selected period boundaries', () => {
		const profile = {
			entryRate: 0.01,
			exitRate: 0.02,
			managementRate: 0,
			performanceRate: 0
		};
		const result = getNetComparisonPoints(points, profile, range);

		expect(result[0]).toMatchObject({ time: 0, value: 100 });
		expect(result[1]).toMatchObject({ value: 99, feeEvent: 'after-entry' });
		expect(result.at(-2)).toMatchObject({ value: 118.8, feeEvent: 'before-exit' });
		expect(result.at(-1)).toMatchObject({ time: 90 * day, feeEvent: 'after-exit' });
		expect(result.at(-1)?.value).toBeCloseTo(116.424);
		expect(result.every((point, index) => index === 0 || point.time > result[index - 1].time)).toBe(true);
	});

	test('includes one-time fees in a pinned one-month annualised return', () => {
		const flatMonth = [
			{ time: 0, value: 100 },
			{ time: 30 * day, value: 100 }
		];
		const profile = { entryRate: 0.01, exitRate: 0.02, managementRate: 0, performanceRate: 0 };
		expect(getNetComparisonPeriodMetrics(flatMonth, profile, [0, 30 * day]).cagr).toBeCloseTo(-0.30793728);
	});

	test('matches Gross exactly for a zero-fee profile', () => {
		const profile = {
			entryRate: 0,
			exitRate: 0,
			managementRate: 0,
			performanceRate: 0
		};
		expect(getNetComparisonPoints(points, profile, range)).toEqual(points);
		const metrics = getNetComparisonPeriodMetrics(points, profile, range);
		expect(metrics.since).toBe('1970-01-01');
		expect(metrics.cagr).toBeGreaterThan(0);
	});

	test('applies externalised management before performance fees', () => {
		const profile = {
			entryRate: 0,
			exitRate: 0,
			managementRate: 0.02,
			performanceRate: 0.2
		};
		const result = getNetComparisonPoints(points, profile, range);
		const managementFee = 100 * 0.02 * (90 / 365.25);
		const expected = 120 - managementFee - (20 - managementFee) * 0.2;
		expect(result.at(-1)?.value).toBeCloseTo(expected);
	});

	test('never creates a negative investor balance', () => {
		const profile = {
			entryRate: 0,
			exitRate: 0,
			managementRate: 1,
			performanceRate: 0
		};
		const longRange: [number, number] = [0, 5 * 365 * day];
		const collapsed = [
			{ time: 0, value: 100 },
			{ time: 5 * 365 * day, value: 1 }
		];
		expect(getNetComparisonPoints(collapsed, profile, longRange).at(-1)?.value).toBe(0);
	});

	test('still accounts for boundary fees when timestamps are too close for synthetic points', () => {
		const closePoints = [
			{ time: 0, value: 100 },
			{ time: 3, value: 110 }
		];
		const profile = { entryRate: 0.1, exitRate: 0.1, managementRate: 0, performanceRate: 0 };
		const result = getNetComparisonPoints(closePoints, profile, [0, 3]);

		expect(result[0]).toEqual({ time: 0, value: 90, feeEvent: 'after-entry' });
		expect(result[1]).toMatchObject({ time: 3, feeEvent: 'after-exit' });
		expect(result[1].value).toBeCloseTo(89.1);
		expect(getNetComparisonPeriodMetrics(closePoints, profile, [0, 3]).cagr).toBeLessThan(0);
	});

	test('shows a fee-adjusted liquidation value when only one point is visible', () => {
		const profile = { entryRate: 0.1, exitRate: 0.2, managementRate: 0.03, performanceRate: 0.4 };
		expect(getNetComparisonPoints([{ time: day, value: 100 }], profile, [day, day])).toEqual([
			{ time: day, value: 72, feeEvent: 'after-exit' }
		]);
		expect(getNetComparisonPeriodMetrics([{ time: day, value: 100 }], profile, [day, day])).toEqual({
			cagr: null,
			since: '1970-01-02'
		});
	});
});
