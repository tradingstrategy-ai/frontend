import { expect, test } from '@playwright/test';

test.describe('stablecoin / chain heatmap chart data endpoint', () => {
	test('returns cached JSON payload with aligned heatmap data', async ({ request }) => {
		const response = await request.get('/trading-view/vaults/stablecoin-chain-heatmap/chart-data');
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('application/json');
		expect(response.headers()['cache-control']).toBe('public, max-age=7200');

		const data = await response.json();
		expect(data.generatedAt).toEqual(expect.any(String));
		expect(data.durationMs).toEqual(expect.any(Number));
		expect(data.cacheTtlSeconds).toBe(7200);
		expect(data.chains.length).toBeGreaterThan(0);
		expect(data.stablecoins.length).toBeGreaterThan(0);
		expect(data.cells.length).toBeGreaterThan(0);
		expect(data.chains.length).toBeLessThanOrEqual(10);
		expect(data.stablecoins.length).toBeLessThanOrEqual(10);

		for (const chain of data.chains) {
			expect(chain.key).toEqual(expect.any(String));
			expect(chain.label).toEqual(expect.any(String));
			expect(chain.chainIds).toBeInstanceOf(Array);
			if (chain.href != null) expect(chain.href).toEqual(expect.any(String));
		}

		for (const stablecoin of data.stablecoins) {
			expect(stablecoin.key).toEqual(expect.any(String));
			expect(stablecoin.label).toEqual(expect.any(String));
			expect(stablecoin.stablecoinSlug).toEqual(expect.any(String));
			expect(stablecoin.href).toEqual(expect.any(String));
		}

		for (const cell of data.cells) {
			expect(cell.chainKey).toEqual(expect.any(String));
			expect(cell.stablecoinKey).toEqual(expect.any(String));
			expect(cell.tvl).toEqual(expect.any(Number));
			expect(cell.vaultCount).toEqual(expect.any(Number));
		}
	});
});

test.describe('stablecoin / chain heatmap page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/trading-view/vaults/stablecoin-chain-heatmap');
	});

	test('renders the ECharts heatmap canvas', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();
		await expect(plotWrapper.locator('.chart-canvas canvas')).toBeVisible({ timeout: 15000 });
		const firstStablecoin = plotWrapper.locator('.stablecoin-axis a').first();
		const firstChain = plotWrapper.locator('.chain-axis a').first();
		await expect(firstStablecoin).toBeVisible();
		await expect(firstChain).toBeVisible();
		await expect(firstStablecoin).toHaveAttribute('title', /Current vault TVL:/);
		await expect(firstChain).toHaveAttribute('title', /Current vault TVL:/);
		await expect(plotWrapper.getByText('Min TVL:')).toHaveCount(0);
	});

	test('has vault listings navigation with active Charts dropdown', async ({ page }) => {
		const nav = page.locator('.vault-listings-selector');
		const trigger = nav.locator('button', { hasText: 'Charts' });
		await expect(trigger).toHaveClass(/active/);

		await trigger.click();
		await expect(page.locator('[role="menu"] a.active')).toHaveText('Stablecoin / Chain heatmap');
	});
});
