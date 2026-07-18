import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, test } from 'vitest';
import { createTestVault } from '$lib/top-vaults/test-utils';
import type { PeriodMetrics } from '$lib/top-vaults/schemas';
import VaultMetrics from './VaultMetrics.svelte';

const MISSING_FEE_TOOLTIP = 'The fee information is not available onchain. Net returns cannot be calculated.';

afterEach(cleanup);

function createPeriodMetrics(
	period: string,
	grossReturn: number,
	grossCagr: number,
	netReturn: number | null
): PeriodMetrics {
	return {
		period,
		error_reason: null,
		period_start_at: '2026-01-01T00:00:00',
		period_end_at: '2026-02-01T00:00:00',
		share_price_start: 1,
		share_price_end: 1 + grossReturn,
		raw_samples: 31,
		samples_start_at: '2026-01-01T00:00:00',
		samples_end_at: '2026-02-01T00:00:00',
		daily_samples: 31,
		returns_gross: grossReturn,
		returns_net: netReturn,
		cagr_gross: grossCagr,
		cagr_net: netReturn,
		volatility: null,
		sharpe: null,
		max_drawdown: null,
		tvl_start: null,
		tvl_end: null,
		tvl_low: null,
		tvl_high: null,
		ranking_overall: null,
		ranking_chain: null,
		ranking_protocol: null
	};
}

describe('VaultMetrics', () => {
	test('shows no data tooltips when fee information and net returns are missing', () => {
		const vault = createTestVault('No fee data vault', {
			one_month_cagr: 0.12,
			one_month_returns: 0.01,
			three_months_cagr: 0.14,
			three_months_returns: 0.03,
			cagr: 0.11,
			lifetime_return: 0.08,
			net_fees: null,
			period_results: [createPeriodMetrics('6m', 0.05, 0.1, null), createPeriodMetrics('1y', 0.08, 0.08, null)]
		});

		render(VaultMetrics, { props: { vault } });

		expect(screen.getAllByText('No data')).toHaveLength(25);
		expect(screen.getAllByText(MISSING_FEE_TOOLTIP)).toHaveLength(25);
		expect(screen.getAllByText('12.0%').length).toBeGreaterThan(0);
	});

	test('formats known fee and net return values normally', () => {
		const vault = createTestVault('Known fee vault', {
			one_month_cagr: 0.12,
			one_month_returns: 0.01,
			one_month_cagr_net: 0.1,
			one_month_returns_net: 0.008,
			three_months_cagr: 0.14,
			three_months_returns: 0.03,
			three_months_cagr_net: 0.11,
			three_months_returns_net: 0.025,
			cagr: 0.11,
			cagr_net: 0.09,
			lifetime_return: 0.08,
			lifetime_return_net: 0.07,
			net_fees: {
				fee_mode: 'externalised',
				performance: 0.2,
				management: 0.01,
				deposit: 0,
				withdraw: 0
			},
			period_results: [createPeriodMetrics('6m', 0.05, 0.1, 0.04), createPeriodMetrics('1y', 0.08, 0.08, 0.07)]
		});

		render(VaultMetrics, { props: { vault } });

		expect(screen.queryByText('No data')).not.toBeInTheDocument();
		expect(screen.getAllByText('20.0%').length).toBeGreaterThan(0);
		expect(screen.getAllByText('0.0%').length).toBeGreaterThan(0);
		expect(screen.getAllByText('10.0%').length).toBeGreaterThan(0);
	});
});
