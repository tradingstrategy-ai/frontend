import { describe, expect, it } from 'vitest';
import type { StrategyInfo } from 'trade-executor/models/strategy-info';
import { compareStrategiesForFrontend, compareStrategiesForFrontpage } from './sort';

function createStrategy({
	id,
	name,
	sort_priority,
	tileChartDirection = 'absolute',
	chartValues,
	annualReturn,
	rawAnnualReturn
}: {
	id: string;
	name: string;
	sort_priority: number;
	tileChartDirection?: 'absolute' | 'relative';
	chartValues?: [number, number];
	annualReturn?: number;
	rawAnnualReturn?: number;
}): StrategyInfo {
	return {
		id,
		name,
		sort_priority,
		url: '',
		hiddenPositions: [],
		hiddenElements: { timeframes: false },
		frontpage: false,
		microsite: false,
		depositExternal: false,
		useSharePrice: false,
		tileChartDirection,
		summary_statistics: chartValues
			? ({
					compounding_unrealised_trading_profitability: [
						[1, chartValues[0]],
						[2, chartValues[1]]
					],
					return_annualised: rawAnnualReturn,
					key_metrics: annualReturn === undefined ? {} : { cagr: { value: annualReturn } }
				} as StrategyInfo['summary_statistics'])
			: annualReturn === undefined && rawAnnualReturn === undefined
				? undefined
				: ({
						return_annualised: rawAnnualReturn,
						key_metrics: annualReturn === undefined ? {} : { cagr: { value: annualReturn } }
					} as StrategyInfo['summary_statistics']),
		connected: false,
		icon_url: '',
		error: 'test error'
	};
}

describe('compareStrategiesForFrontend', () => {
	it('lists green charts first and ranks each chart-colour group by annual return', () => {
		const strategies = [
			createStrategy({ id: 'red-high', name: 'Red high', sort_priority: 999, chartValues: [0, -0.1], annualReturn: 2 }),
			createStrategy({ id: 'red-low', name: 'Red low', sort_priority: 999, chartValues: [0, -0.2], annualReturn: 0.1 }),
			createStrategy({
				id: 'green-low',
				name: 'Green low',
				sort_priority: 999,
				chartValues: [0, 0.1],
				annualReturn: 0.2
			}),
			createStrategy({
				id: 'green-high',
				name: 'Green high',
				sort_priority: 0,
				chartValues: [0, 0.2],
				annualReturn: 0.5
			}),
			createStrategy({ id: 'neutral', name: 'Neutral', sort_priority: 999, chartValues: [0, 0], annualReturn: 5 }),
			createStrategy({ id: 'no-data', name: 'No data', sort_priority: 500, annualReturn: 6 })
		];

		const sortedIds = strategies.sort(compareStrategiesForFrontend).map((strategy) => strategy.id);

		expect(sortedIds).toEqual(['green-high', 'green-low', 'red-high', 'red-low', 'neutral', 'no-data']);
	});

	it('uses the annual return displayed on the strategy tile', () => {
		const strategies = [
			createStrategy({
				id: 'gmx',
				name: 'GMX',
				sort_priority: 0,
				chartValues: [0, 0.2],
				annualReturn: -0.64,
				rawAnnualReturn: 1.38
			}),
			createStrategy({
				id: 'hyper-ai',
				name: 'HyperAI',
				sort_priority: 0,
				chartValues: [0, 0.1],
				annualReturn: 0.66,
				rawAnnualReturn: 0.56
			})
		];

		const sortedIds = strategies.sort(compareStrategiesForFrontend).map((strategy) => strategy.id);

		expect(sortedIds).toEqual(['hyper-ai', 'gmx']);
	});

	it('uses the relative chart change when that controls the tile colour', () => {
		const strategies = [
			createStrategy({
				id: 'relative-profit',
				name: 'Relative profit',
				sort_priority: 0,
				tileChartDirection: 'relative',
				chartValues: [-0.5, -0.4],
				annualReturn: 0.1
			}),
			createStrategy({
				id: 'absolute-loss',
				name: 'Absolute loss',
				sort_priority: 0,
				chartValues: [0, -0.1],
				annualReturn: 2
			})
		];

		const sortedIds = strategies.sort(compareStrategiesForFrontend).map((strategy) => strategy.id);

		expect(sortedIds).toEqual(['relative-profit', 'absolute-loss']);
	});

	it('uses sort priority when annual returns are tied or unavailable', () => {
		const strategies = [
			createStrategy({ id: 'low', name: 'Low', sort_priority: 1 }),
			createStrategy({ id: 'high', name: 'High', sort_priority: 5 }),
			createStrategy({ id: 'tied', name: 'Tied', sort_priority: 10, chartValues: [0, 0.2], annualReturn: 0.2 }),
			createStrategy({
				id: 'tied-lower-priority',
				name: 'Tied lower priority',
				sort_priority: 1,
				chartValues: [0, 0.2],
				annualReturn: 0.2
			})
		];

		const sortedIds = strategies.sort(compareStrategiesForFrontend).map((strategy) => strategy.id);

		expect(sortedIds).toEqual(['tied', 'tied-lower-priority', 'high', 'low']);
	});

	it('keeps frontpage strategies in the requested order', () => {
		const strategies = [
			createStrategy({ id: 'vega', name: 'Premium Harvest Vault', sort_priority: 999 }),
			createStrategy({ id: 'other-high', name: 'Other high', sort_priority: 100 }),
			createStrategy({ id: 'hyper-ai', name: 'HyperAI', sort_priority: 1 }),
			createStrategy({ id: 'master-vault', name: 'Master Vault', sort_priority: 1 })
		];

		const sortedIds = strategies.sort(compareStrategiesForFrontpage).map((strategy) => strategy.id);

		expect(sortedIds).toEqual(['master-vault', 'hyper-ai', 'vega', 'other-high']);
	});
});
