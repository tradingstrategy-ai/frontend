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

const aboveTvl = generateMockVaults('Above TVL', 250, {
	get current_nav() {
		return Math.random() * 1_000_000 + 50_000;
	},
	get peak_nav() {
		return Math.random() * 1_500_000 + 50_000;
	},
	one_month_returns: 0.05,
	get three_months_returns() {
		return (Math.random() - 0.2) * 0.5;
	},
	get three_months_cagr() {
		return (Math.random() - 0.1) * 0.8;
	}
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

export default defineMock({
	url: '/api/top-vaults/vaults.json',
	body: {
		generated_at: new Date().toISOString(),
		vaults: [yamlStrategyVault, ...belowTvl, ...aboveTvl]
	}
});
