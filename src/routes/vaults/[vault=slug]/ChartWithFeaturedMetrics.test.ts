import { describe, expect, test } from 'vitest';
import { createTestVault } from '$lib/top-vaults/test-utils';
import {
	getAbsolutePeriodReturn,
	getDaysInvested,
	getFeaturedPerformanceExample,
	getFeaturedPerformancePeriod,
	getFeaturedPerformanceReturnLabel,
	getFeaturedPerformanceReturnMode
} from './featured-performance';

describe('featured vault performance', () => {
	test.each(['1M', '3M', 'Lifetime'])('labels %s gross returns', (periodLabel) => {
		expect(getFeaturedPerformanceReturnLabel(periodLabel, 'gross')).toBe(`${periodLabel} ann. gross returns`);
	});

	test.each(['1M', '3M', 'Lifetime'])('labels %s net returns', (periodLabel) => {
		expect(getFeaturedPerformanceReturnLabel(periodLabel, 'net')).toBe(`${periodLabel} ann. net returns`);
	});

	test('uses net returns only when fee information and net CAGR are available', () => {
		expect(getFeaturedPerformanceReturnMode(true, 0.12)).toBe('net');
		expect(getFeaturedPerformanceReturnMode(true, null)).toBe('gross');
		expect(getFeaturedPerformanceReturnMode(false, 0.12)).toBe('gross');
	});

	test('calculates elapsed days and uses the backend 365.25-day convention', () => {
		expect(getDaysInvested('2026-01-01T00:00:00Z', '2026-04-01T00:00:00Z')).toBe(90);
		expect(getDaysInvested(null, '2026-04-01T00:00:00Z')).toBeNull();
		expect(getAbsolutePeriodReturn(null, 0.1, 365.25)).toBeCloseTo(0.1);
	});

	test('keeps metrics and dates from the same period result', () => {
		const vault = createTestVault('Period result vault', {
			one_month_cagr: 0.1,
			one_month_returns: 0.01,
			period_results: [
				{
					period: '1M',
					error_reason: null,
					period_start_at: '2026-08-01T00:00:00',
					period_end_at: '2026-09-01T00:00:00',
					share_price_start: 1,
					share_price_end: 1.015,
					raw_samples: 31,
					samples_start_at: '2026-08-01T00:00:00',
					samples_end_at: '2026-09-01T00:00:00',
					daily_samples: 31,
					cagr_gross: 0.2,
					cagr_net: 0.18,
					returns_gross: 0.015,
					returns_net: 0.014,
					sharpe: 1.2,
					volatility: 0.3,
					max_drawdown: -0.02,
					tvl_start: 10_000,
					tvl_end: 10_150,
					tvl_low: 9_900,
					tvl_high: 10_200,
					ranking_overall: null,
					ranking_chain: null,
					ranking_protocol: null
				}
			]
		});

		expect(getFeaturedPerformancePeriod(vault, '1M')).toMatchObject({
			return: {
				gross: { annualised: 0.2, absolute: 0.015 },
				net: { annualised: 0.18, absolute: 0.014 }
			},
			startDate: '2026-08-01T00:00:00',
			endDate: '2026-09-01T00:00:00'
		});
	});

	test('reconciles Kingfisher deposit fees and internalised performance fees', () => {
		const vault = createTestVault('The Kingfisher Vault', {
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
				management: 0,
				performance: 0,
				deposit: 0.01,
				withdraw: 0
			},
			three_months_cagr: 0.07485289164219067,
			three_months_cagr_net: -0.11398435934727147,
			three_months_returns: 0.003762000000000043,
			three_months_returns_net: -0.006275619999999926,
			three_months_start: '2026-08-12T00:00:00',
			three_months_end: '2026-08-31T00:00:00'
		});
		const example = getFeaturedPerformanceExample(vault, getFeaturedPerformancePeriod(vault, '3M'), 10_000);

		expect(example.daysInvested).toBe(19);
		expect(example.depositFee.amount).toBe(100);
		expect(example.capitalInvested).toBe(9_900);
		expect(example.grossCapitalAtEnd).toBeCloseTo(9_937.2438);
		expect(example.capitalOut).toBeCloseTo(9_937.2438);
		expect(example.performanceFee).toEqual({ rate: 0.3, amount: null, internalised: true });
		expect(example.managementFee).toEqual({ rate: 0, amount: 0, internalised: false });
	});

	test('applies externalised management before performance fees', () => {
		const vault = createTestVault('Block4Block', {
			fee_internalised: false,
			gross_fees: {
				fee_mode: 'externalised',
				management: 0.0075,
				performance: 0.075,
				deposit: 0,
				withdraw: 0
			},
			net_fees: {
				fee_mode: 'externalised',
				management: 0.0075,
				performance: 0.075,
				deposit: 0,
				withdraw: 0
			},
			three_months_returns: 0.02101479423192898,
			three_months_returns_net: 0.01772923907931867,
			three_months_start: '2026-06-03T00:00:00',
			three_months_end: '2026-09-01T00:00:00'
		});
		const example = getFeaturedPerformanceExample(vault, getFeaturedPerformancePeriod(vault, '3M'), 10_000);

		expect(example.managementFee.amount).toBeCloseTo(18.4805);
		expect(example.performanceFee.amount).toBeCloseTo(14.3751);
		expect(example.grossCapitalAtEnd! - example.managementFee.amount! - example.performanceFee.amount!).toBeCloseTo(
			example.capitalOut!
		);
	});

	test('reconciles combined externalised and withdrawal fees', () => {
		const grossReturn = 0.02101479423192898;
		const managementFee = 10_000 * 0.0075 * (90 / 365.25);
		const performanceFee = (10_000 * grossReturn - managementFee) * 0.075;
		const preWithdrawalCapital = 10_000 * (1 + grossReturn) - managementFee - performanceFee;
		const capitalOut = preWithdrawalCapital * (1 - 0.005);
		const vault = createTestVault('Combined fee vault', {
			fee_internalised: false,
			gross_fees: {
				fee_mode: 'externalised',
				management: 0.0075,
				performance: 0.075,
				deposit: 0,
				withdraw: 0.005
			},
			net_fees: {
				fee_mode: 'externalised',
				management: 0.0075,
				performance: 0.075,
				deposit: 0,
				withdraw: 0.005
			},
			three_months_returns: grossReturn,
			three_months_returns_net: capitalOut / 10_000 - 1,
			three_months_start: '2026-06-03T00:00:00',
			three_months_end: '2026-09-01T00:00:00'
		});
		const example = getFeaturedPerformanceExample(vault, getFeaturedPerformancePeriod(vault, '3M'), 10_000);

		expect(example.withdrawalFee.amount).toBeCloseTo(preWithdrawalCapital * 0.005);
		expect(
			example.grossCapitalAtEnd! -
				example.managementFee.amount! -
				example.performanceFee.amount! -
				example.withdrawalFee.amount!
		).toBeCloseTo(example.capitalOut!);
	});

	test('never invents a dollar deduction for internalised fees', () => {
		const vault = createTestVault('Internalised fee vault', {
			fee_internalised: true,
			gross_fees: {
				fee_mode: 'internalised_minting',
				management: 0.02,
				performance: 0.2,
				deposit: 0,
				withdraw: 0
			},
			net_fees: {
				fee_mode: 'internalised_minting',
				management: 0.01,
				performance: 0.1,
				deposit: 0,
				withdraw: 0
			},
			three_months_returns: 0.02,
			three_months_returns_net: 0.02,
			three_months_start: '2026-06-03T00:00:00',
			three_months_end: '2026-09-01T00:00:00'
		});
		const example = getFeaturedPerformanceExample(vault, getFeaturedPerformancePeriod(vault, '3M'), 10_000);

		expect(example.managementFee).toEqual({ rate: 0.02, amount: null, internalised: true });
		expect(example.performanceFee).toEqual({ rate: 0.2, amount: null, internalised: true });
	});

	test('calculates withdrawal fees from the pre-withdrawal balance', () => {
		const vault = createTestVault('Midas MEV', {
			fee_internalised: true,
			gross_fees: {
				fee_mode: 'internalised_skimming',
				management: null,
				performance: null,
				deposit: 0,
				withdraw: 0.005
			},
			net_fees: {
				fee_mode: 'internalised_skimming',
				management: 0,
				performance: 0,
				deposit: 0,
				withdraw: 0.005
			},
			three_months_returns: 0.01725660478978197,
			three_months_returns_net: 0.012170321765833103,
			three_months_start: '2026-06-03T00:00:00',
			three_months_end: '2026-09-01T00:00:00'
		});
		const example = getFeaturedPerformanceExample(vault, getFeaturedPerformancePeriod(vault, '3M'), 10_000);

		expect(example.withdrawalFee.amount).toBeCloseTo(50.8628);
		expect(example.grossCapitalAtEnd! - example.withdrawalFee.amount!).toBeCloseTo(example.capitalOut!);
	});
});
