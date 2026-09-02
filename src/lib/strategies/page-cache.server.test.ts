import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { StrategyInfo } from 'trade-executor/models/strategy-info';

const mocks = vi.hoisted(() => ({ getAllStrategies: vi.fn() }));

vi.mock('trade-executor/client/strategy-info', () => ({ getAllStrategies: mocks.getAllStrategies }));
vi.mock('$lib/strategies/yaml/loader', () => ({ yamlStrategies: new Map() }));
vi.mock('$lib/top-vaults/client', () => ({ fetchTopVaults: vi.fn() }));
vi.mock('$lib/helpers/public-api', () => ({ fetchPublicApi: async () => ({}) }));

import {
	getStrategiesPageData,
	resetStrategiesPageCacheForTests,
	STRATEGIES_PAGE_CACHE_TTL_MS
} from './page-cache.server';

let directory: string;

function strategy(id: string, tags: string[]): StrategyInfo {
	return { id, name: id, tags, sort_priority: 1, useSharePrice: false, connected: true } as StrategyInfo;
}

beforeEach(async () => {
	directory = await mkdtemp(join(tmpdir(), 'strategies-page-cache-'));
	resetStrategiesPageCacheForTests(directory);
	mocks.getAllStrategies.mockReset();
	mocks.getAllStrategies.mockResolvedValue([strategy('live', ['live']), strategy('hidden', ['archived'])]);
});

afterEach(async () => {
	resetStrategiesPageCacheForTests();
	await rm(directory, { recursive: true, force: true });
});

describe('strategies page filesystem cache', () => {
	it('persists separate public and admin snapshots for 30 minutes', async () => {
		const fetch = vi.fn() as unknown as Fetch;
		const publicData = await getStrategiesPageData(fetch, false);
		const adminData = await getStrategiesPageData(fetch, true);

		expect(publicData.strategies.map((item) => item.id)).toEqual(['live']);
		expect(adminData.strategies.map((item) => item.id)).toEqual(expect.arrayContaining(['live', 'hidden']));
		expect(mocks.getAllStrategies).toHaveBeenCalledOnce();
		expect(await readFile(join(directory, 'strategies-page.devalue'), 'utf8')).toContain('live');
		expect(STRATEGIES_PAGE_CACHE_TTL_MS).toBe(30 * 60 * 1000);
	});

	it('loads a persisted snapshot after a simulated process restart', async () => {
		const fetch = vi.fn() as unknown as Fetch;
		await getStrategiesPageData(fetch, false);
		resetStrategiesPageCacheForTests(directory);
		mocks.getAllStrategies.mockRejectedValue(new Error('The persisted snapshot should avoid this request'));

		const data = await getStrategiesPageData(fetch, false);
		expect(data.strategies.map((item) => item.id)).toEqual(['live']);
		expect(mocks.getAllStrategies).toHaveBeenCalledOnce();
	});

	it('keeps disconnected strategies renderable in a cold snapshot', async () => {
		mocks.getAllStrategies.mockResolvedValue([{ ...strategy('offline', ['live']), connected: false }]);

		const data = await getStrategiesPageData(vi.fn() as unknown as Fetch, false);
		expect(data.strategies.map((item) => item.id)).toEqual(['offline']);
	});
});
