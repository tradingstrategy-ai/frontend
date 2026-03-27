import type { VaultInfo } from '$lib/top-vaults/schemas';
import { type TestVaultProps, createTestVault } from '$lib/top-vaults/test-utils';
import { defineMock } from 'vite-plugin-mock-dev-server';

function generateMockVaults(prefix: string, count: number, props: TestVaultProps = {}): VaultInfo[] {
	const vaults: VaultInfo[] = [];
	const chains = ['ethereum', 'polygon', 'arbitrum', 'base', 'avalanche'];
	const protocols = ['Yearn', 'Aave', 'Compound', 'Morpho', 'Gearbox', 'Sommelier'];
	const denominations = ['USDC', 'USDT', 'DAI'];
	const risks = ['Negligible', 'Minimal', 'Low', 'High', 'Severe', 'Dangerous'] as const;

	for (let i = 0; i < count; i++) {
		vaults.push(
			createTestVault(`${prefix} ${String(i).padStart(3, '0')}`, {
				chain: chains[i % chains.length],
				protocol: protocols[i % protocols.length],
				denomination: denominations[i % denominations.length],
				risk: risks[i % risks.length],
				...props
			})
		);
	}

	return vaults;
}

function createPeriodResult(
	period: '6m' | '1y',
	returnsNet: number,
	returnsGross: number,
	cagrNet: number,
	cagrGross: number
) {
	const startAt = period === '6m' ? '2025-07-01T00:00:00+00:00' : '2025-01-01T00:00:00+00:00';

	return {
		period,
		error_reason: null,
		period_start_at: startAt,
		period_end_at: '2026-01-01T00:00:00+00:00',
		share_price_start: 1.0,
		share_price_end: 1 + returnsNet,
		raw_samples: period === '6m' ? 4320 : 8760,
		samples_start_at: startAt,
		samples_end_at: '2026-01-01T00:00:00+00:00',
		daily_samples: period === '6m' ? 180 : 365,
		returns_gross: returnsGross,
		returns_net: returnsNet,
		cagr_gross: cagrGross,
		cagr_net: cagrNet,
		volatility: 0.12,
		sharpe: 1.3,
		max_drawdown: -0.04,
		tvl_start: 450_000,
		tvl_end: 600_000,
		tvl_low: 400_000,
		tvl_high: 650_000,
		ranking_overall: 1,
		ranking_chain: 1,
		ranking_protocol: 1
	};
}

const belowTvl = generateMockVaults('Below TVL', 50, {
	get current_nav() {
		return Math.random() * 50_000;
	},
	get peak_nav() {
		return Math.random() * 80_000 + 10_000;
	},
	get three_months_returns() {
		return (Math.random() - 0.3) * 0.4;
	},
	get three_months_cagr() {
		return (Math.random() - 0.2) * 0.6;
	}
});

const aboveTvl = generateMockVaults('Above TVL', 246, {
	get current_nav() {
		return Math.random() * 1_000_000 + 50_000;
	},
	get peak_nav() {
		return Math.random() * 1_500_000 + 50_000;
	},
	one_month_returns: 0.05,
	get one_month_cagr() {
		return Math.random() * 0.5 + 0.02;
	},
	get three_months_returns() {
		return (Math.random() - 0.2) * 0.5;
	},
	get three_months_cagr() {
		return (Math.random() - 0.1) * 0.8;
	}
});

const returnLeaders = [
	createTestVault('Return leader alpha', {
		chain: 'ethereum',
		protocol: 'Yearn',
		current_nav: 800_000,
		peak_nav: 900_000,
		one_month_returns: 0.04,
		one_month_cagr: 0.32,
		three_months_returns: 0.1,
		three_months_cagr: 0.24,
		cagr: 0.22,
		lifetime_return: 0.35,
		period_results: [createPeriodResult('6m', 0.16, 0.18, 0.42, 0.45), createPeriodResult('1y', 0.28, 0.3, 0.28, 0.3)]
	}),
	createTestVault('Return leader beta', {
		chain: 'arbitrum',
		protocol: 'Morpho',
		current_nav: 780_000,
		peak_nav: 850_000,
		one_month_returns: 0.035,
		one_month_cagr: 0.26,
		three_months_returns: 0.085,
		three_months_cagr: 0.21,
		cagr: 0.19,
		lifetime_return: 0.31,
		period_results: [createPeriodResult('6m', 0.12, 0.14, 0.31, 0.34), createPeriodResult('1y', 0.2, 0.22, 0.2, 0.22)]
	}),
	createTestVault('Return leader gamma', {
		chain: 'base',
		protocol: 'Compound',
		current_nav: 760_000,
		peak_nav: 830_000,
		one_month_returns: 0.03,
		one_month_cagr: 0.22,
		three_months_returns: 0.07,
		three_months_cagr: 0.18,
		cagr: 0.16,
		lifetime_return: 0.27,
		period_results: [createPeriodResult('6m', 0.08, 0.1, 0.22, 0.25), createPeriodResult('1y', 0.14, 0.16, 0.14, 0.16)]
	})
];

const limitedCoverageVault = createTestVault('Limited coverage vault', {
	chain: 'ethereum',
	protocol: 'Yearn',
	current_nav: 720_000,
	peak_nav: 760_000,
	one_month_returns: 0.02,
	one_month_cagr: 0.18,
	three_months_returns: 0.05,
	three_months_cagr: 0.2,
	three_months_start: '2025-11-15T00:00:00+00:00',
	three_months_end: '2026-01-01T00:00:00+00:00',
	three_months_samples: 45,
	cagr: 0.17,
	lifetime_return: 0.24,
	period_results: [
		{
			period: '3m',
			error_reason: null,
			period_start_at: '2025-11-15T00:00:00+00:00',
			period_end_at: '2026-01-01T00:00:00+00:00',
			share_price_start: 0.98,
			share_price_end: 1.03,
			raw_samples: 1080,
			samples_start_at: '2025-11-15T00:00:00+00:00',
			samples_end_at: '2026-01-01T00:00:00+00:00',
			daily_samples: 45,
			returns_gross: 0.06,
			returns_net: 0.05,
			cagr_gross: 0.23,
			cagr_net: 0.2,
			volatility: 0.12,
			sharpe: 1.2,
			max_drawdown: -0.04,
			tvl_start: 680_000,
			tvl_end: 720_000,
			tvl_low: 660_000,
			tvl_high: 760_000,
			ranking_overall: 12,
			ranking_chain: 4,
			ranking_protocol: 2
		},
		{
			period: '6m',
			error_reason: null,
			period_start_at: '2025-09-01T00:00:00+00:00',
			period_end_at: '2026-01-01T00:00:00+00:00',
			share_price_start: 0.93,
			share_price_end: 1.08,
			raw_samples: 2880,
			samples_start_at: '2025-09-01T00:00:00+00:00',
			samples_end_at: '2026-01-01T00:00:00+00:00',
			daily_samples: 120,
			returns_gross: 0.17,
			returns_net: 0.15,
			cagr_gross: 0.34,
			cagr_net: 0.3,
			volatility: 0.14,
			sharpe: 1.4,
			max_drawdown: -0.05,
			tvl_start: 610_000,
			tvl_end: 720_000,
			tvl_low: 590_000,
			tvl_high: 760_000,
			ranking_overall: 9,
			ranking_chain: 3,
			ranking_protocol: 2
		},
		{
			period: '1y',
			error_reason: null,
			period_start_at: '2025-05-01T00:00:00+00:00',
			period_end_at: '2026-01-01T00:00:00+00:00',
			share_price_start: 0.89,
			share_price_end: 1.08,
			raw_samples: 5760,
			samples_start_at: '2025-05-01T00:00:00+00:00',
			samples_end_at: '2026-01-01T00:00:00+00:00',
			daily_samples: 240,
			returns_gross: 0.21,
			returns_net: 0.19,
			cagr_gross: 0.21,
			cagr_net: 0.19,
			volatility: 0.15,
			sharpe: 1.3,
			max_drawdown: -0.07,
			tvl_start: 540_000,
			tvl_end: 720_000,
			tvl_low: 500_000,
			tvl_high: 760_000,
			ranking_overall: 11,
			ranking_chain: 4,
			ranking_protocol: 2
		}
	]
});

// Named vault for YAML strategy integration tests
const yamlStrategyVault = createTestVault('Trading Strategy ICHIv3 LS 2', {
	address: '0x1234567890abcdef1234567890abcdef12345678',
	chain: 'ethereum',
	current_nav: 500_000,
	peak_nav: 600_000,
	one_month_returns: 0.03,
	one_month_cagr: 0.42,
	three_months_returns: 0.08,
	three_months_cagr: 0.35,
	three_months_sharpe: 1.5,
	cagr_net: 0.28,
	lifetime_return_net: 0.15,
	period_results: [
		{
			period: '1m',
			error_reason: null,
			period_start_at: '2025-12-01T00:00:00',
			period_end_at: '2026-01-01T00:00:00',
			share_price_start: 1.0,
			share_price_end: 1.03,
			raw_samples: 720,
			samples_start_at: '2025-12-01T00:00:00',
			samples_end_at: '2026-01-01T00:00:00',
			daily_samples: 30,
			returns_gross: 0.035,
			returns_net: 0.03,
			cagr_gross: 0.52,
			cagr_net: 0.42,
			volatility: 0.15,
			sharpe: 2.1,
			max_drawdown: -0.05,
			tvl_start: 480_000,
			tvl_end: 500_000,
			tvl_low: 460_000,
			tvl_high: 520_000,
			ranking_overall: 5,
			ranking_chain: 2,
			ranking_protocol: 1
		},
		{
			period: '3m',
			error_reason: null,
			period_start_at: '2025-10-01T00:00:00',
			period_end_at: '2026-01-01T00:00:00',
			share_price_start: 0.95,
			share_price_end: 1.03,
			raw_samples: 2160,
			samples_start_at: '2025-10-01T00:00:00',
			samples_end_at: '2026-01-01T00:00:00',
			daily_samples: 90,
			returns_gross: 0.09,
			returns_net: 0.08,
			cagr_gross: 0.4,
			cagr_net: 0.35,
			volatility: 0.18,
			sharpe: 1.5,
			max_drawdown: -0.08,
			tvl_start: 400_000,
			tvl_end: 500_000,
			tvl_low: 380_000,
			tvl_high: 520_000,
			ranking_overall: 8,
			ranking_chain: 3,
			ranking_protocol: 1
		}
	]
});

// Real Parquet-backed vault IDs used by the historical TVL by chain endpoint tests.
// These IDs need to match the local Parquet dataset so blacklist filtering can be
// exercised against real server-side aggregation.
const parquetMatchedVaults = [
	createTestVault('Savings infiniFi USD', {
		address: '0x36585e7ae4b8a422135618a2c113b8b516067e7a',
		chain: 'arbitrum',
		protocol: 'Trading Strategy',
		current_nav: 3_200_000,
		peak_nav: 3_800_000,
		one_month_cagr: 0.16,
		three_months_cagr: 0.18
	}),
	createTestVault('Savings USDS', {
		address: '0xa3931d71877c0e7a3148cb7eb4463524fec27fbd',
		chain: 'ethereum',
		protocol: 'Trading Strategy',
		current_nav: 2_400_000,
		peak_nav: 2_700_000,
		one_month_cagr: 0.09,
		three_months_cagr: 0.11
	}),
	createTestVault('Peapods Interest Bearing USDC - 42', {
		address: '0x4b5c90dc6bc08a10a24487726e614e9d148362e1',
		chain: 'base',
		protocol: 'Trading Strategy',
		current_nav: 1_900_000,
		peak_nav: 2_100_000,
		one_month_cagr: 0.13,
		three_months_cagr: 0.15
	}),
	createTestVault('atvPTmax', {
		address: '0xd24e4a98b5fd90ff21a9cc5e2c1254de8084cd81',
		chain: 'ethereum',
		protocol: 'Trading Strategy',
		current_nav: 8_000_000,
		peak_nav: 9_500_000,
		one_month_cagr: 0.2,
		three_months_cagr: 0.22,
		risk: 'Blacklisted'
	})
];

export default defineMock({
	url: '/api/top-vaults/vaults.json',
	body: {
		generated_at: new Date().toISOString(),
		vaults: [
			yamlStrategyVault,
			limitedCoverageVault,
			...parquetMatchedVaults,
			...returnLeaders,
			...belowTvl,
			...aboveTvl
		]
	}
});
