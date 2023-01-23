import { render } from '@testing-library/svelte';
import StrategyTile from './StrategyTile.svelte';

const baseStrategy = {
	id: 'strategy_1',
	name: 'Strategy 1',
	short_description: 'A wonderful strategy',
	long_description: 'This strategy will make you lots of money.',
	icon_url: 'https://beautiful.image',
	started_at: 1669852800,
	executor_running: true
};

describe('StrategyTile component', () => {
	describe('with complete summary statistics', () => {
		const strategy = {
			...baseStrategy,
			summary_statistics: {
				calculated_at: 1669939200,
				first_trade_at: null,
				last_trade_at: null,
				enough_data: true,
				current_value: 1_234.56,
				profitability_90_days: 0.0789,
				performance_chart_90_days: null
			}
		};

		test('should display historic performance value with no warning', async () => {
			const { getByText, queryByTitle } = render(StrategyTile, { strategy });
			const performance = getByText('Historic performance').nextElementSibling;
			expect(performance).toHaveTextContent('▲ 7.9%');
			expect(queryByTitle(/less than 90 days of performance data/)).toBeNull;
		});

		test('should set historic performance bullish/bearish class', async () => {
			const { getByText } = render(StrategyTile, { strategy });
			const performance = getByText('Historic performance').nextElementSibling;
			expect(performance).toHaveClass('price-change-green');
		});

		test('should display assets value', async () => {
			const { getByText } = render(StrategyTile, { strategy });
			const assets = getByText('Amount of assets').nextElementSibling;
			expect(assets).toHaveTextContent('$1.23k');
		});
	});

	describe('with incomplete summary statistics (enough_data: false)', () => {
		const strategy = {
			...baseStrategy,
			summary_statistics: {
				calculated_at: 1669939200,
				first_trade_at: null,
				last_trade_at: null,
				enough_data: false,
				current_value: 1_234.56,
				profitability_90_days: 0.0789,
				performance_chart_90_days: null
			}
		};

		test('should display historic performance value with insufficient data warning', async () => {
			const { getByText, getByTitle } = render(StrategyTile, { strategy });
			const performance = getByText('Historic performance').nextElementSibling;
			expect(performance).toHaveTextContent('▲ 7.9%');
			getByTitle(/less than 90 days of performance data/);
		});
	});

	describe('with error', () => {
		const strategy = {
			...baseStrategy,
			error: 'oops - an error occurred!'
		};

		test('should display error message', async () => {
			const { getByText } = render(StrategyTile, { strategy });
			getByText('Strategy data not currently available.');
		});
	});
});
