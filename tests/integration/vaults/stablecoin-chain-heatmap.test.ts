import { expect, test, type Page } from '@playwright/test';

type EChartsOption = {
	graphic?: { elements?: { id?: string }[] }[];
	yAxis?: { inverse?: boolean } | { inverse?: boolean }[];
};

declare global {
	interface Window {
		echarts?: {
			getInstanceByDom: (container: Element) =>
				| {
						getOption?: () => EChartsOption;
				  }
				| undefined;
		};
	}
}

async function expectNativeChartWatermark(page: Page, containerSelector: string) {
	await expect
		.poll(async () =>
			page.evaluate((selector) => {
				const echartsApi = window.echarts;
				const container = document.querySelector(selector);
				const graphic = container ? echartsApi?.getInstanceByDom(container)?.getOption?.().graphic : undefined;
				const elements = Array.isArray(graphic) ? (graphic[0]?.elements ?? []) : [];
				return elements.some((element) => element.id === 'chart-watermark');
			}, containerSelector)
		)
		.toBe(true);
}

test.describe('stablecoin / chain heatmap chart data endpoint', () => {
	test('returns cached JSON payload with aligned heatmap data', async ({ request }) => {
		const response = await request.get('/vaults/stablecoin-chain-heatmap/chart-data');
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
		await page.goto('/vaults/stablecoin-chain-heatmap');
	});

	test('renders the ECharts heatmap canvas', async ({ page }) => {
		const plotWrapper = page.getByTestId('vault-scatter-plot');
		await expect(plotWrapper).toBeVisible();
		await expect(plotWrapper.locator('.chart-canvas canvas')).toBeVisible({ timeout: 15000 });
		await expectNativeChartWatermark(page, '.chart-canvas');
		const firstStablecoin = plotWrapper.locator('.stablecoin-axis a').first();
		const firstChain = plotWrapper.locator('.chain-axis a').first();
		await expect(firstStablecoin).toBeVisible();
		await expect(firstChain).toBeVisible();
		await expect(plotWrapper.getByText('Min TVL:')).toHaveCount(0);
		await expect
			.poll(async () =>
				page.evaluate(() => {
					const container = document.querySelector('.chart-canvas');
					const yAxis = container ? window.echarts?.getInstanceByDom(container)?.getOption?.().yAxis : undefined;
					const firstYAxis = Array.isArray(yAxis) ? yAxis[0] : yAxis;
					return firstYAxis?.inverse;
				})
			)
			.toBe(true);
	});

	test('axis labels link to stablecoin and chain vault pages', async ({ page }) => {
		const stablecoinLabel = page.locator('.stablecoin-axis a').first();
		const chainLabel = page.locator('.chain-axis a').first();

		await expect(stablecoinLabel).toHaveAttribute('href', /\/vaults\/stablecoins\//);
		await expect(chainLabel).toHaveAttribute('href', /\/vaults\/chains\//);

		const stablecoinHref = await stablecoinLabel.getAttribute('href');
		expect(stablecoinHref).toBeTruthy();
		await stablecoinLabel.click();
		await expect(page).toHaveURL(new RegExp(`${stablecoinHref?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));

		await page.goto('/vaults/stablecoin-chain-heatmap');

		const reloadedChainLabel = page.locator('.chain-axis a').first();
		const chainHref = await reloadedChainLabel.getAttribute('href');
		expect(chainHref).toBeTruthy();
		await reloadedChainLabel.click();
		await expect(page).toHaveURL(new RegExp(`${chainHref?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
	});

	test('has vault listings navigation with active Charts dropdown', async ({ page }) => {
		const nav = page.locator('.vault-listings-selector');
		const trigger = nav.locator('button', { hasText: 'Charts' });
		await expect(trigger).toHaveClass(/active/);

		await trigger.click();
		await expect(page.locator('[role="menu"] a.active')).toHaveText('Stablecoin / Chain heatmap');
	});
});
