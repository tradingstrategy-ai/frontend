import { render } from '@testing-library/svelte';
import StrategyTile from './StrategyTile.svelte';

const baseStrategy = {
	id: 'strategy_1',
	name: 'Strategy 1',
	short_description: 'A wonderful strategy',
	long_description: 'This strategy will make you lots of money.',
	icon_url: 'https://beautiful.image',
	started_at: 1669852800,
	executor_running: true,
	connected: true,
	frozen_positions: 0,
	on_chain_data: {
		asset_management_mode: 'enzyme'
	}
};

describe('StrategyTile component', () => {
	describe('with complete summary statistics', () => {
		const strategy = {
			...baseStrategy,
			summary_statistics: {
				calculated_at: 1688122807,
				first_trade_at: 1687536017,
				last_trade_at: 1688101212,
				enough_data: false,
				current_value: 3.5415780000000003,
				profitability_90_days: -0.005961082353416414,
				performance_chart_90_days: [[1687651200, -0.005961082353416414]],
				key_metrics: {
					sharpe: {
						kind: 'sharpe',
						source: 'backtesting',
						value: 3.9684764214657933,
						calculation_window_start_at: 1657296000,
						calculation_window_end_at: 1672527600,
						calculation_method: 'historical_data',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/sharpe'
					},
					sortino: {
						kind: 'sortino',
						source: 'backtesting',
						value: 14.67799033842019,
						calculation_window_start_at: 1657296000,
						calculation_window_end_at: 1672527600,
						calculation_method: 'historical_data',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/sortino'
					},
					max_drawdown: {
						kind: 'max_drawdown',
						source: 'backtesting',
						value: 0.021535892651893596,
						calculation_window_start_at: 1657296000,
						calculation_window_end_at: 1672527600,
						calculation_method: 'historical_data',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/maximum-drawdown'
					},
					profitability: {
						kind: 'profitability',
						source: 'backtesting',
						value: 0.12,
						calculation_window_start_at: 1657296000,
						calculation_window_end_at: 1672527600,
						calculation_method: 'historical_data',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/profitability'
					},
					total_equity: {
						kind: 'total_equity',
						source: 'live_trading',
						value: 2.328766,
						calculation_window_start_at: 1657296000,
						calculation_window_end_at: 1672527600,
						calculation_method: 'latest_value',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/total-equity'
					},
					started_at: {
						kind: 'started_at',
						source: 'live_trading',
						value: 1687525301,
						calculation_window_start_at: 1657296000,
						calculation_window_end_at: 1672527600,
						calculation_method: 'latest_value',
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/strategy-age'
					}
				}
			}
		};

		test('should display historic performance value', async () => {
			const { getByTestId } = render(StrategyTile, { strategy });
			const performanceElem = getByTestId('key-metric-profitability-value');
			expect(performanceElem).toHaveTextContent('▲ 12.0%');
		});

		test('should set historic performance bullish/bearish class', async () => {
			const { container } = render(StrategyTile, { strategy });
			const bullIndicator = container.querySelector('.bullish');
			expect(bullIndicator).not.toBeNull();
		});
	});

	describe('with no connection', () => {
		const strategy = {
			...baseStrategy,
			connected: false
		};

		test('should display error message', async () => {
			const { getByText } = render(StrategyTile, { strategy });
			getByText(/Trade executor offline/);
		});
	});
});
