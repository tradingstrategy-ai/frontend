import { describe, expect, test } from 'vitest';
import {
	buildProtocolMiniChartPayload,
	PROTOCOL_MINI_CHART_TVL_OUTLIER_THRESHOLD,
	type ProtocolMiniChartDailyRow
} from './protocol-mini-chart';

function createRows(id: string, tvl: number, startPrice: number, endPrice: number): ProtocolMiniChartDailyRow[] {
	return Array.from({ length: 31 }, (_, index) => {
		const date = new Date('2026-01-01T00:00:00Z');
		date.setUTCDate(date.getUTCDate() + index);
		const progress = index / 30;

		return {
			id,
			day: date.toISOString().slice(0, 10),
			tvl,
			sharePrice: startPrice + (endPrice - startPrice) * progress
		};
	});
}

describe('buildProtocolMiniChartPayload', () => {
	test('aggregates TVL and calculates TVL-weighted 30 day annualised APY', () => {
		const rows = [...createRows('vault-a', 100, 1, 1.01), ...createRows('vault-b', 300, 1, 1.02)];
		const payload = buildProtocolMiniChartPayload(rows, 2, 3600, new Date('2026-02-01T00:00:00Z'));
		const latest = payload.points.at(-1);

		expect(payload.points).toHaveLength(31);
		expect(payload.meta).toMatchObject({
			vaultCount: 2,
			rawDailyVaultPoints: 62,
			excludedOutlierPoints: 0,
			pointsWithApy: 1
		});
		expect(latest?.date).toBe('2026-01-31');
		expect(latest?.tvl).toBe(400);
		expect(latest?.apy).toBeCloseTo(0.236, 2);
	});

	test('forward fills TVL when a vault has missing daily rows', () => {
		const rows = [
			...createRows('vault-a', 100, 1, 1.01),
			...createRows('vault-b', 300, 1, 1.02).filter((row) => row.day !== '2026-01-20')
		];
		const payload = buildProtocolMiniChartPayload(rows, 2, 3600);
		const missingDay = payload.points.find((point) => point.date === '2026-01-20');

		expect(missingDay?.tvl).toBe(400);
	});

	test('includes TVL rows without a usable share price', () => {
		const rows = [...createRows('vault-a', 100, 1, 1.01), ...createRows('vault-without-price', 300, 0, 0)];
		const payload = buildProtocolMiniChartPayload(rows, 2, 3600);
		const latest = payload.points.at(-1);

		expect(latest?.tvl).toBe(400);
		expect(latest?.apy).toBeCloseTo(0.129, 2);
	});

	test('excludes TVL outlier rows using the shared vault outlier threshold', () => {
		const rows = [
			...createRows('vault-a', 100, 1, 1.01),
			...createRows('vault-outlier', PROTOCOL_MINI_CHART_TVL_OUTLIER_THRESHOLD + 1, 1, 1.01)
		];
		const payload = buildProtocolMiniChartPayload(rows, 2, 3600);
		const latest = payload.points.at(-1);

		expect(payload.meta).toMatchObject({
			rawDailyVaultPoints: 62,
			excludedOutlierPoints: 31
		});
		expect(latest?.tvl).toBe(100);
	});

	test('uses table-compatible APY override for the latest point', () => {
		const rows = [...createRows('vault-a', 100, 1, 1.01), ...createRows('vault-b', 300, 1, 1.02)];
		const payload = buildProtocolMiniChartPayload(rows, 2, 3600, {
			generatedAt: new Date('2026-02-01T00:00:00Z'),
			latestApyRows: [
				{ id: 'vault-a', tvl: 100, apy: 0.03 },
				{ id: 'vault-b', tvl: 300, apy: 0.05 }
			]
		});

		expect(payload.points.at(-1)?.apy).toBeCloseTo(0.045);
	});
});
