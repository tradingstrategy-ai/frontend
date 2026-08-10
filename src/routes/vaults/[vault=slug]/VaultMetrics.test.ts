import { cleanup, render, screen, within } from '@testing-library/svelte';
import { afterEach, describe, expect, test } from 'vitest';
import { createTestVault } from '$lib/top-vaults/test-utils';
import type { Core3Protocol, PeriodMetrics } from '$lib/top-vaults/schemas';
import VaultMetrics from './VaultMetrics.svelte';

const MISSING_FEE_TOOLTIP = 'The fee information is not available onchain. Net returns cannot be calculated.';
const SHORT_TERM_FEE_WARNING = 'Deposit and withdrawal fees may greatly affect short-term returns';
const GROSS_RETURNS_TOOLTIP = 'are annualised share-price returns before investor-facing fees are deducted.';
const NET_RETURNS_TOOLTIP =
	'are annualised returns after known investor-facing fees are deducted. One-time deposit and withdrawal fees are included when reported and can dominate short periods.';
const INTERNALISED_FEE_TOOLTIP =
	'Internalised fees are reflected in the share price before returns are shown. Deposit and withdrawal fees may still be applied separately to net returns.';
const INTERNALISED_FEE_DISCLAIMER =
	'Internalised fees are reflected in the share price. One-time deposit and withdrawal fees may still affect net returns.';

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
	test('shows a Xerberus score in preference to a CORE3 rating', () => {
		const vault = createTestVault('Xerberus-rated vault', {
			xerberus: {
				score: 81,
				score_scale: '0–100',
				entity_type: 'protocol',
				entity_id: 'xerberus-protocol',
				name: 'Xerberus protocol',
				protocol_slug: 'xerberus-protocol',
				report_url: 'https://app.xerberus.io/protocol/dendrogram/xerberus-protocol',
				fetched_at: '2026-08-10T00:00:00Z'
			}
		});
		const core3: Core3Protocol = {
			slug: 'xerberus-protocol',
			name: 'Xerberus protocol',
			pol: { score: 20, rating: 'BB', confidence: null }
		};

		render(VaultMetrics, { props: { vault, core3 } });

		expect(screen.getByText('Xerberus risk')).toBeInTheDocument();
		expect(screen.getByText('81 / 100')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Xerberus scored this vault’s underlying protocol on a 0–100 scale. Higher scores indicate lower estimated risk.'
			)
		).toBeInTheDocument();
		expect(screen.queryByText('CORE3 risk')).not.toBeInTheDocument();
	});

	test('shows the CORE3 rating when Xerberus is unavailable', () => {
		const core3: Core3Protocol = {
			slug: 'core3-protocol',
			name: 'CORE3 protocol',
			pol: { score: 20, rating: 'BB', confidence: null }
		};

		render(VaultMetrics, { props: { vault: createTestVault('CORE3-rated vault'), core3 } });

		expect(screen.getByText('CORE3 risk')).toBeInTheDocument();
		expect(screen.getByText('BB')).toBeInTheDocument();
		expect(screen.queryByText('Protocol Technical Risk')).not.toBeInTheDocument();
		expect(screen.queryByText('View more')).not.toBeInTheDocument();
	});

	test('falls back to the protocol technical risk when no provider rating is available', () => {
		render(VaultMetrics, { props: { vault: createTestVault('Unrated vault', { risk: 'Low' }) } });

		expect(screen.getByText('Protocol Technical Risk')).toBeInTheDocument();
		expect(screen.getByText('Low')).toBeInTheDocument();
	});

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
			gross_fees: {
				fee_mode: 'externalised',
				performance: 0.3,
				management: 0.02,
				deposit: 0,
				withdraw: 0
			},
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
		expect(screen.queryByText('20.0%')).not.toBeInTheDocument();
		expect(screen.getAllByText('30.0%').length).toBeGreaterThan(0);
		expect(screen.getAllByText('2.0%').length).toBeGreaterThan(0);
		expect(screen.getAllByText('0.0%').length).toBeGreaterThan(0);
		expect(screen.getAllByText('10.0%').length).toBeGreaterThan(0);
		expect(screen.queryByText(SHORT_TERM_FEE_WARNING)).not.toBeInTheDocument();
		expect(screen.getByText(GROSS_RETURNS_TOOLTIP, { exact: false })).toBeInTheDocument();
		expect(screen.getByText(NET_RETURNS_TOOLTIP, { exact: false })).toBeInTheDocument();
	});

	test('warns on non-zero deposit or withdrawal fee rows', () => {
		const vault = createTestVault('Deposit and withdrawal fee vault', {
			one_month_cagr: 0.12,
			one_month_returns: 0.01,
			one_month_cagr_net: 0.05,
			one_month_returns_net: 0.004,
			three_months_cagr: 0.14,
			three_months_returns: 0.03,
			three_months_cagr_net: 0.1,
			three_months_returns_net: 0.025,
			gross_fees: {
				fee_mode: 'externalised',
				performance: 0.2,
				management: 0,
				deposit: 0.01,
				withdraw: 0.005
			},
			net_fees: {
				fee_mode: 'externalised',
				performance: 0.2,
				management: 0,
				deposit: 0.01,
				withdraw: 0.005
			},
			period_results: [createPeriodMetrics('6m', 0.05, 0.1, 0.04), createPeriodMetrics('1y', 0.08, 0.08, 0.07)]
		});

		render(VaultMetrics, { props: { vault } });

		const getRow = (label: string) => {
			const row = screen
				.getAllByText(label)
				.find((element) => element.classList.contains('label-desktop'))
				?.closest('tr');
			expect(row).toBeTruthy();
			return row as HTMLElement;
		};

		expect(within(getRow('Deposit fee')).getByRole('img', { name: SHORT_TERM_FEE_WARNING })).toBeInTheDocument();
		expect(within(getRow('Withdrawal fee')).getByRole('img', { name: SHORT_TERM_FEE_WARNING })).toBeInTheDocument();
		expect(
			within(getRow('Performance fee')).queryByRole('img', { name: SHORT_TERM_FEE_WARNING })
		).not.toBeInTheDocument();
		expect(
			within(getRow('Management fee')).queryByRole('img', { name: SHORT_TERM_FEE_WARNING })
		).not.toBeInTheDocument();
		expect(screen.getAllByText(SHORT_TERM_FEE_WARNING)).toHaveLength(2);
	});

	test('explains internalised fees in fee and net return tooltips', () => {
		const vault = createTestVault('Internalised fee vault', {
			one_month_cagr: 0.12,
			one_month_returns: 0.01,
			one_month_cagr_net: 0.12,
			one_month_returns_net: 0.01,
			three_months_cagr: 0.14,
			three_months_returns: 0.03,
			three_months_cagr_net: 0.14,
			three_months_returns_net: 0.03,
			cagr: 0.11,
			cagr_net: 0.11,
			lifetime_return: 0.08,
			lifetime_return_net: 0.08,
			fee_internalised: true,
			gross_fees: {
				fee_mode: 'internalised_skimming',
				performance: 0.1,
				management: 0,
				deposit: 0,
				withdraw: 0
			},
			net_fees: {
				fee_mode: 'internalised_skimming',
				performance: 0,
				management: 0,
				deposit: 0,
				withdraw: 0
			},
			period_results: [createPeriodMetrics('6m', 0.05, 0.1, 0.05), createPeriodMetrics('1y', 0.08, 0.08, 0.08)]
		});

		render(VaultMetrics, { props: { vault } });

		expect(screen.getAllByText(INTERNALISED_FEE_TOOLTIP)).toHaveLength(6);
		expect(screen.getByText(INTERNALISED_FEE_DISCLAIMER)).toBeInTheDocument();
	});
});
