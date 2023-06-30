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
	frozen_positions: 0
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
						value: 1.1730542398032315,
						calculation_window_start_at: 1662390000,
						calculation_window_end_at: 1686132000,
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/sharpe'
					},
					sortino: {
						kind: 'sortino',
						source: 'backtesting',
						value: 2.391284951366129,
						calculation_window_start_at: 1662390000,
						calculation_window_end_at: 1686132000,
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/sortino'
					},
					max_drawdown: {
						kind: 'max_drawdown',
						source: 'backtesting',
						value: -0.06757552446733317,
						calculation_window_start_at: 1662390000,
						calculation_window_end_at: 1686132000,
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/maximum-drawdown'
					},
					profitability: {
						kind: 'profitability',
						source: 'backtesting',
						value: 0.12017482229489884,
						calculation_window_start_at: 1662390000,
						calculation_window_end_at: 1686132000,
						unavailability_reason: null,
						help_link: 'https://tradingstrategy.ai/glossary/profitability'
					},
					started_at: {
						kind: 'started_at',
						source: 'live_trading',
						value: 1687523515,
						calculation_window_start_at: 1662390000,
						calculation_window_end_at: 1686132000,
						unavailability_reason: null,
						help_link: null
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
