import { describe, expect, it } from 'vitest';
import type { StrategyInfo } from 'trade-executor/models/strategy-info';
import { compareStrategiesForFrontend, compareStrategiesForFrontpage } from './sort';

function createStrategy({
	id,
	name,
	sort_priority
}: {
	id: string;
	name: string;
	sort_priority: number;
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
		tileChartDirection: 'absolute',
		connected: false,
		icon_url: '',
		error: 'test error'
	};
}

describe('compareStrategiesForFrontend', () => {
	it('keeps pinned strategies in the requested order', () => {
		const strategies = [
			createStrategy({ id: 'gmx-ai', name: 'GMX AI', sort_priority: 999 }),
			createStrategy({ id: 'master-vault', name: 'Master Vault', sort_priority: 999 }),
			createStrategy({ id: 'opencz', name: 'OpenCZ', sort_priority: 0 }),
			createStrategy({ id: 'hyper-ai', name: 'HyperAI', sort_priority: 1 }),
			createStrategy({ id: 'ichi-hyperliquid', name: 'Ichi', sort_priority: 500 })
		];

		const sortedIds = strategies.sort(compareStrategiesForFrontend).map((strategy) => strategy.id);

		expect(sortedIds).toEqual(['opencz', 'hyper-ai', 'master-vault', 'ichi-hyperliquid', 'gmx-ai']);
	});

	it('places all other strategies afterwards by sort priority', () => {
		const strategies = [
			createStrategy({ id: 'other-low', name: 'Other low', sort_priority: 1 }),
			createStrategy({ id: 'other-high', name: 'Other high', sort_priority: 5 }),
			createStrategy({ id: 'opencz', name: 'OpenCZ', sort_priority: 0 })
		];

		const sortedIds = strategies.sort(compareStrategiesForFrontend).map((strategy) => strategy.id);

		expect(sortedIds).toEqual(['opencz', 'other-high', 'other-low']);
	});

	it('keeps frontpage strategies in the requested order', () => {
		const strategies = [
			createStrategy({ id: 'opencz', name: 'OpenCZ', sort_priority: 999 }),
			createStrategy({ id: 'other-high', name: 'Other high', sort_priority: 100 }),
			createStrategy({ id: 'master-vault', name: 'Master Vault', sort_priority: 1 })
		];

		const sortedIds = strategies.sort(compareStrategiesForFrontpage).map((strategy) => strategy.id);

		expect(sortedIds).toEqual(['opencz', 'master-vault', 'other-high']);
	});
});
