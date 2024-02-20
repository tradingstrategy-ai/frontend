import { render } from '@testing-library/svelte';
import StrategyTile from './StrategyTile.svelte';
import type { ConnectedStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';

const baseStrategy = {
	id: 'strategy_1',
	name: 'Strategy 1',
	url: 'https://strategy_1.example.com',
	icon_url: 'https://beautiful.image'
};

const chain = {
	chain_id: 1,
	chain_slug: 'ethereum',
	chain_name: 'Ethereum'
};

describe('StrategyTile component', () => {
	describe('with no connection', () => {
		const strategy = {
			...baseStrategy,
			connected: false,
			error: 'Trade executor offline'
		} as const;

		test('should display error message', async () => {
			const { getByText } = render(StrategyTile, { strategy, chain });
			// check for tooltip trigger
			getByText(/Error/);
			// check for tooltip popup content
			const popup = getByText(/Trade executor offline/);
		});
	});

	describe('connected with complete summary statistics', () => {
		const strategy = {
			...baseStrategy,
			connected: true,
			short_description: 'A wonderful strategy',
			long_description: 'This strategy will make you lots of money.',
			on_chain_data: {
				chain_id: 1,
				asset_management_mode: 'enzyme',
				smart_contracts: {}
			},
			started_at: new Date(1669852800000),
			executor_running: true,
			frozen_positions: 0,
			summary_statistics: {
				calculated_at: new Date(1688122807000),
				launched_at: new Date(1687536000000),
				first_trade_at: new Date(1687536017000),
				last_trade_at: new Date(1688101212000),
				enough_data: false,
				current_value: 3.5415780000000003,
				profitability_90_days: -0.005961082353416414,
				performance_chart_90_days: [[new Date(1687651200000), -0.005961082353416414]],
				key_metrics: {
					sharpe: {
						kind: 'sharpe',
						source: 'backtesting',
						value: 3.9684764214657933,
						calculation_window_start_at: new Date(1657296000000),
						calculation_window_end_at: new Date(1672527600000),
						calculation_method: 'historical_data',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/sharpe'
					},
					sortino: {
						kind: 'sortino',
						source: 'backtesting',
						value: 14.67799033842019,
						calculation_window_start_at: new Date(1657296000000),
						calculation_window_end_at: new Date(1672527600000),
						calculation_method: 'historical_data',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/sortino'
					},
					max_drawdown: {
						kind: 'max_drawdown',
						source: 'backtesting',
						value: 0.021535892651893596,
						calculation_window_start_at: new Date(1657296000000),
						calculation_window_end_at: new Date(1672527600000),
						calculation_method: 'historical_data',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/maximum-drawdown'
					},
					profitability: {
						kind: 'profitability',
						source: 'backtesting',
						value: 0.12,
						calculation_window_start_at: new Date(1657296000000),
						calculation_window_end_at: new Date(1672527600000),
						calculation_method: 'historical_data',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/profitability'
					},
					total_equity: {
						kind: 'total_equity',
						source: 'live_trading',
						value: 2.328766,
						calculation_window_start_at: new Date(1657296000000),
						calculation_window_end_at: new Date(1672527600000),
						calculation_method: 'latest_value',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/total-equity'
					},
					started_at: {
						kind: 'started_at',
						source: 'live_trading',
						value: 1687525301,
						calculation_window_start_at: new Date(1657296000000),
						calculation_window_end_at: new Date(1672527600000),
						calculation_method: 'latest_value',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/strategy-age'
					}
				}
			},
			backtest_available: false,
			badges: [],
			tags: []
		} as ConnectedStrategyRuntimeState;

		// This test is intentionally checking for very specific markup:
		// The strategy tile container element MUST NOT be an anchor tag.
		// Otherwise, you end up with illegal element nesting with Tooltips
		// that include anchor tags in the popup content. The illegal nesting
		// leads to page jank (popup content is not hidden on initial page render).
		test('should not be an anchor element', () => {
			const { container } = render(StrategyTile, { strategy, chain });
			const el = container.querySelector('.strategy-tile');
			expect(el?.tagName).not.toBe('A');
			// check for nested anchors just to be sure!
			const nestedAnchors = container.querySelectorAll('a[href] a[href]');
			expect(nestedAnchors).toHaveLength(0);
		});

		test('should display historic performance value', async () => {
			const { getByTestId } = render(StrategyTile, { strategy, chain });
			const performanceElem = getByTestId('key-metric-profitability-value');
			expect(performanceElem).toHaveTextContent('▲ 12.0%');
		});

		test('should set historic performance bullish/bearish class', async () => {
			const { container } = render(StrategyTile, { strategy, chain });
			const bullIndicator = container.querySelector('.bullish');
			expect(bullIndicator).not.toBeNull();
		});
	});
});
