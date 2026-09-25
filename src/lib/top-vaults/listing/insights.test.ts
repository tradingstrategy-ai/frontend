import { describe, expect, test } from 'vitest';
import { createTestVault } from '../test-utils';
import { getYieldLeaders, LEADER_MIN_TVL_USD } from './insights';

const vault = (name: string, props = {}) =>
	createTestVault(name, {
		protocol: 'Morpho',
		chain_id: 1,
		years: 1,
		risk: 'Low',
		current_nav: 1_000_000,
		one_month_cagr: 0.05,
		...props
	});

describe('getYieldLeaders', () => {
	test('names the three highest-APY vaults that are large and old enough', () => {
		const insights = getYieldLeaders([
			vault('Steady', { one_month_cagr: 0.06 }),
			vault('Best', { one_month_cagr: 0.12 }),
			vault('Second', { one_month_cagr: 0.09 }),
			vault('Third', { one_month_cagr: 0.07 }),
			vault('Tiny spike', { one_month_cagr: 0.9, current_nav: LEADER_MIN_TVL_USD - 1 }),
			vault('Brand new', { one_month_cagr: 0.5, years: 0.1 }),
			vault('Artefact', { one_month_cagr: 25 }),
			vault('Trading vault', { one_month_cagr: 0.8, risk: 'Severe' }),
			createTestVault('Unrated', {
				protocol: 'Morpho',
				chain_id: 1,
				years: 1,
				current_nav: 1_000_000,
				one_month_cagr: 0.3
			}),
			vault('Too good', { one_month_cagr: 1.5 }),
			vault('Trading fund', { one_month_cagr: 0.7, strategy_tags: ['discretionary_trading'] }),
			vault('AMM pool', { one_month_cagr: 0.6, features: ['amm_pool_like'] }),
			vault('Tokenised fund', { one_month_cagr: 0.5, flags: ['tokenised_fund'] }),
			vault('NewBet', { one_month_cagr: 0.45 }),
			vault('Blacklisted', { one_month_cagr: 0.4, risk: 'Blacklisted' })
		]);

		expect(insights.leaders.map((leader) => leader.name)).toEqual(['Best', 'Second', 'Third']);
		expect(insights.leaders[0]).toMatchObject({
			name: 'Best',
			slug: 'best',
			apy: 0.12,
			tvlUsd: 1_000_000,
			protocol: 'Morpho',
			curator: null
		});
		expect(insights.eligibleCount).toBe(4);
		expect(insights.medianApy).toBeCloseTo(0.08);
	});

	test('returns no leaders and no median when there is no data', () => {
		expect(getYieldLeaders([])).toEqual({ leaders: [], medianApy: null, eligibleCount: 0 });
	});
});
