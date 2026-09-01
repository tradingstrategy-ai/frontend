import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

type SearchResult = {
	name: string;
	vaultId: string | null;
};

/**
 * Resolve a vault ID through the same server-side search used by the selector.
 */
async function findVaultId(request: APIRequestContext, query: string, name: string): Promise<string> {
	const response = await request.get('/search/suggestions', {
		params: { q: query, scope: 'vaults', limit: 20, minimumVaultTvlUsd: 1_000 },
		timeout: 30_000
	});
	expect(response.ok()).toBe(true);
	const result = ((await response.json()) as { results: SearchResult[] }).results.find(
		(candidate) => candidate.name === name
	);
	expect(result?.vaultId).toBeTruthy();
	return result!.vaultId!;
}

/**
 * Return chart-ready mock series spanning more than one year.
 */
function responsiveChartPoints(seriesIndex: number) {
	const start = 1_704_067_200;
	return Array.from({ length: 15 - seriesIndex * 2 }, (_, pointIndex) => {
		const value = 100 + pointIndex * (2 + seriesIndex);
		return {
			time: start + (pointIndex + seriesIndex * 2) * 30 * 24 * 60 * 60,
			value
		};
	});
}

/**
 * Return deterministic server-calculated metrics for mocked chart periods.
 */
function mockPeriodMetrics(seriesIndex = 0) {
	return {
		'1M': { cagr: 0.11 + seriesIndex / 100, since: '2025-02-01' },
		'3M': { cagr: 0.13 + seriesIndex / 100, since: '2024-12-01' },
		'6M': { cagr: 0.16 + seriesIndex / 100, since: '2024-09-01' },
		'1Y': { cagr: 0.21 + seriesIndex / 100, since: '2024-03-01' },
		Max: { cagr: 0.25 + seriesIndex / 100, since: '2024-01-01' }
	};
}

/**
 * Mock only the server-prepared chart payload and retain request details for assertions.
 */
async function mockResponsiveChartData(page: Page) {
	const requests: Array<{ vaults: string[]; benchmarks: string[] }> = [];
	await page.route('**/vaults/compare/chart-data?*', async (route) => {
		const params = new URL(route.request().url()).searchParams;
		const vaults = params.getAll('vault');
		const benchmarks = params.getAll('benchmark');
		requests.push({ vaults, benchmarks });
		const vaultSeries = vaults.map((id, index) => {
			const points = responsiveChartPoints(index);
			return {
				id,
				discontinuous: false,
				points: { '4h': points, '1d': points },
				periodMetrics: mockPeriodMetrics(index)
			};
		});
		const benchmarkSeries = benchmarks.map((id) => {
			const points = responsiveChartPoints(0);
			return {
				id,
				discontinuous: false,
				points: { '4h': points, '1d': points },
				periodMetrics: mockPeriodMetrics()
			};
		});
		const allPoints = [...vaultSeries, ...benchmarkSeries].flatMap((series) => series.points['1d']);

		await route.fulfill({
			contentType: 'application/json',
			body: JSON.stringify({
				range: [allPoints[0].time, allPoints.at(-1)!.time],
				vaultSeries,
				benchmarkSeries,
				missingVaultIds: [],
				benchmarkErrors: {}
			})
		});
	});
	return requests;
}

test.describe('vault equity curve comparison page', () => {
	test('selects Savings USDS and all benchmarks by default', async ({ page }) => {
		const chartRequests = await mockResponsiveChartData(page);

		await page.goto('/vaults/compare');

		const selectedVaults = page.getByRole('list', { name: 'Selected vaults' });
		await expect(page.getByRole('heading', { name: 'Selected vaults' })).toBeVisible();
		await expect(selectedVaults.locator('li')).toHaveCount(1);
		await expect(selectedVaults).toContainText('Savings USDS');
		await expect(selectedVaults).toContainText('13.0% CAGR');
		await expect(selectedVaults).toContainText('Since 2024-12-01');
		await expect(page.getByRole('checkbox', { name: 'T-Bill' })).toBeChecked();
		await expect(page.getByRole('checkbox', { name: 'ETH' })).toBeChecked();
		await expect(page.getByRole('checkbox', { name: 'BTC' })).toBeChecked();
		await expect(page.locator('.benchmark-options .benchmark-logo')).toHaveCount(3);
		expect(new URL(page.url()).searchParams.getAll('vault')).toHaveLength(1);
		expect(new URL(page.url()).searchParams.getAll('benchmark')).toEqual(['treasury', 'eth', 'btc']);
		await expect.poll(() => chartRequests.at(-1)?.benchmarks).toEqual(['treasury', 'eth', 'btc']);
		await expect(page.getByTestId('page-search')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });

		await page.getByRole('button', { name: 'Remove Savings USDS from comparison' }).click();
		await expect(page.getByRole('list', { name: 'Selected vaults' })).toHaveCount(0);
		expect(new URL(page.url()).searchParams.get('comparison')).toBe('empty');
	});

	test('adds, compares and removes vaults while keeping state in the URL', async ({ page }) => {
		test.setTimeout(120_000);
		const batchRequests: string[][] = [];
		const suggestionMinimumTvls: string[] = [];
		const pageErrors: string[] = [];
		page.on('pageerror', (error) => pageErrors.push(error.message));
		await page.route('**/vaults/compare/chart-data?*', async (route) => {
			const searchParams = new URL(route.request().url()).searchParams;
			const vaultIds = searchParams.getAll('vault');
			const benchmarks = searchParams.getAll('benchmark');
			batchRequests.push(vaultIds);
			await new Promise((resolve) => setTimeout(resolve, 300));
			const pointsFor = (index: number) =>
				(index === 0
					? [
							[1_735_689_600, 100],
							[1_735_776_000, 110],
							[1_735_862_400, 120]
						]
					: [
							[1_735_776_000, 110],
							[1_735_862_400, 121]
						]
				).map(([time, value]) => ({
					time,
					value
				}));
			await route.fulfill({
				contentType: 'application/json',
				body: JSON.stringify({
					range: [1_735_689_600, 1_735_862_400],
					vaultSeries: vaultIds.map((id, index) => ({
						id,
						discontinuous: false,
						points: { '4h': pointsFor(index), '1d': pointsFor(index) },
						periodMetrics: mockPeriodMetrics(index)
					})),
					benchmarkSeries: benchmarks.map((id) => ({
						id,
						discontinuous: false,
						points: { '4h': pointsFor(0), '1d': pointsFor(0) },
						periodMetrics: mockPeriodMetrics()
					})),
					missingVaultIds: [],
					benchmarkErrors: {}
				})
			});
		});
		await page.route('**/vaults/coinbase-candles?*', async (route) => {
			await route.fulfill({
				contentType: 'application/json',
				body: JSON.stringify([
					[1_735_689_600, 3_300],
					[1_735_776_000, 3_400],
					[1_735_862_400, 3_500]
				])
			});
		});
		await page.route('**/search/suggestions?*', async (route) => {
			suggestionMinimumTvls.push(new URL(route.request().url()).searchParams.get('minimumVaultTvlUsd') ?? '');
			await new Promise((resolve) => setTimeout(resolve, 300));
			await route.continue();
		});

		await page.goto('/vaults/compare?comparison=empty');

		await expect(page).toHaveTitle(/Compare and find best DeFi vault yield/);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Analyse more than 5000 vaults');
		await expect(page.getByRole('heading', { name: 'Compare vaults' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Add vaults to compare' })).toBeVisible();
		await expect(page.getByRole('checkbox')).toHaveCount(3);
		await expect(page.getByTestId('page-search')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });

		let search = page.getByRole('combobox', { name: 'Search vaults to compare' });
		await search.fill('Savings USDS');
		await expect(page.getByRole('status')).toContainText('Searching…');
		const savingsUsdsResult = page.getByRole('option', { name: /Savings USDS/ }).first();
		await expect(savingsUsdsResult.getByLabel('1 month APY')).toBeVisible();
		await expect(savingsUsdsResult.getByLabel('Latest TVL')).toBeVisible();
		await expect(savingsUsdsResult.getByRole('img', { name: /Savings USDS 90 day price/ })).toBeVisible();
		expect(suggestionMinimumTvls.at(-1)).toBe('1000');
		const [searchBounds, menuBounds] = await Promise.all([
			search.boundingBox(),
			page.getByRole('dialog', { name: 'Search' }).boundingBox()
		]);
		expect(Math.abs((searchBounds?.x ?? 0) - (menuBounds?.x ?? 0))).toBeLessThanOrEqual(1);
		expect(Math.abs((searchBounds?.width ?? 0) - (menuBounds?.width ?? 0))).toBeLessThanOrEqual(1);
		await savingsUsdsResult.click();
		await expect(search).toHaveValue('');
		await expect(page.getByRole('dialog', { name: 'Search' })).toBeHidden();

		const selectedVaults = page.getByRole('list', { name: 'Selected vaults' });
		await expect(selectedVaults).toContainText('Savings USDS');
		await expect(selectedVaults.locator('li').first()).toHaveCSS('padding-left', '0px');
		await expect(page.getByTestId('tv-chart').locator('.loading')).toBeVisible();
		expect(new URL(page.url()).pathname).toBe('/vaults/compare');
		await expect(page.getByRole('heading', { name: 'Vault returns index' })).toBeVisible();
		await expect(page.locator('.comparison-chart .chart-container')).toHaveClass(/boxed/);
		const timePeriodOptions = page.locator('.comparison-chart .segmented-control label');
		await expect(timePeriodOptions).toHaveText(['1M', '3M', '6M', '1Y', 'Max']);
		await timePeriodOptions.filter({ hasText: '1Y' }).click();
		await expect(timePeriodOptions.filter({ hasText: '1Y' })).toHaveClass(/selected/);
		await expect(selectedVaults).toContainText('21.0% CAGR');
		await expect(selectedVaults).toContainText('Since 2024-03-01');
		await expect(page.getByTestId('page-search')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
		expect(new URL(page.url()).searchParams.getAll('vault')).toHaveLength(1);
		await expect.poll(() => batchRequests.at(-1)?.length).toBe(1);

		search = page.getByTestId('page-search').getByRole('combobox', { name: 'Search vaults to compare' });
		await search.fill('Savings infiniFi USD');
		await page.getByRole('button', { name: 'Add Savings infiniFi USD to comparison' }).first().click();
		await expect(search).toHaveValue('');
		await expect(page.getByRole('dialog', { name: 'Search' })).toBeHidden();
		await expect(selectedVaults.locator('li')).toHaveCount(2);
		expect(new URL(page.url()).searchParams.getAll('vault')).toHaveLength(2);
		await expect.poll(() => batchRequests.at(-1)?.length).toBe(2);
		const comparisonTable = page.getByRole('region', { name: 'Selected vault comparison' });
		await expect(comparisonTable.getByRole('table')).toBeVisible();
		await expect(comparisonTable.getByRole('row').filter({ hasText: 'Savings USDS' })).toBeVisible();
		await expect(comparisonTable.getByRole('row').filter({ hasText: 'Savings infiniFi USD' })).toBeVisible();
		await expect(page.getByTestId('tv-chart').locator('.loading')).toBeHidden();
		const chartRequestCountBeforeSort = batchRequests.length;
		await comparisonTable.getByRole('button', { name: 'Vault' }).click();
		await expect.poll(() => new URL(page.url()).searchParams.get('sort')).toBe('vault');
		expect(new URL(page.url()).searchParams.getAll('vault')).toHaveLength(2);
		await page.waitForTimeout(500);
		expect(batchRequests).toHaveLength(chartRequestCountBeforeSort);
		const vaultColours = await selectedVaults
			.locator('.vault-colour')
			.evaluateAll((swatches) => swatches.map((swatch) => getComputedStyle(swatch).borderTopColor));
		expect(new Set(vaultColours).size).toBe(2);

		await page.getByRole('checkbox', { name: 'ETH' }).check();
		const chartLegend = page.getByLabel('Equity comparison chart legend');
		await expect(chartLegend).toContainText('ETH');
		expect(new URL(page.url()).searchParams.getAll('benchmark')).toEqual(['eth']);
		await expect(
			page
				.getByRole('checkbox', { name: 'ETH' })
				.locator('xpath=following-sibling::img[contains(@class, "benchmark-logo")]')
		).toHaveAttribute('src', '/logos/tokens/eth');
		expect(
			await chartLegend
				.locator('.legend-item')
				.filter({ hasText: 'ETH' })
				.locator('.swatch')
				.evaluate((swatch) => getComputedStyle(swatch).borderTopColor)
		).toBe('rgba(98, 126, 234, 0.5)');

		const sharedUrl = page.url();
		await page.goto('/vaults/compare?comparison=empty');
		await page.goto(sharedUrl);
		await expect(selectedVaults.locator('li')).toHaveCount(2);
		await expect(selectedVaults).toContainText('Savings USDS');
		await expect(selectedVaults).toContainText('Savings infiniFi USD');
		await expect(page.getByRole('checkbox', { name: 'T-Bill' })).not.toBeChecked();
		await expect(page.getByRole('checkbox', { name: 'ETH' })).toBeChecked();
		await expect(page.getByRole('checkbox', { name: 'BTC' })).not.toBeChecked();
		expect(page.url()).toBe(sharedUrl);
		await timePeriodOptions.filter({ hasText: '1Y' }).click();
		await expect(timePeriodOptions.filter({ hasText: '1Y' })).toHaveClass(/selected/);

		await page.getByRole('button', { name: 'Remove Savings USDS from comparison' }).click();
		await expect(selectedVaults.locator('li')).toHaveCount(1);
		await expect(selectedVaults).not.toContainText('Savings USDS');
		expect(new URL(page.url()).searchParams.getAll('vault')).toHaveLength(1);
		await expect.poll(() => batchRequests.at(-1)?.length).toBe(1);

		await page.getByRole('button', { name: 'Remove Savings infiniFi USD from comparison' }).click();
		await expect(page.getByRole('heading', { name: 'Add vaults to compare' })).toBeVisible();
		search = page.getByTestId('page-search').getByRole('combobox', { name: 'Search vaults to compare' });
		await search.fill('Savings USDS');
		await page
			.getByRole('option', { name: /Savings USDS/ })
			.first()
			.click();
		await expect(page.locator('.comparison-chart .segmented-control label').filter({ hasText: '1Y' })).toHaveClass(
			/selected/
		);
		await expect(selectedVaults).toContainText('21.0% CAGR');
		await expect(selectedVaults).toContainText('Since 2024-03-01');
		expect(pageErrors).toEqual([]);
	});

	for (const viewport of [
		{ name: 'tablet', width: 1024, height: 768 },
		{ name: 'mobile', width: 375, height: 667 }
	]) {
		test(`compares two vaults and a benchmark in the ${viewport.name} viewport`, async ({ page, request }) => {
			test.setTimeout(120_000);
			await page.setViewportSize({ width: viewport.width, height: viewport.height });
			const pageErrors: string[] = [];
			page.on('pageerror', (error) => pageErrors.push(error.message));
			const chartRequests = await mockResponsiveChartData(page);
			const savingsUsdsId = await findVaultId(request, 'Savings USDS', 'Savings USDS');
			const savingsInfiniFiId = await findVaultId(request, 'Savings infiniFi USD', 'Savings infiniFi USD');
			const selection = new URLSearchParams();
			selection.append('vault', savingsUsdsId);
			selection.append('vault', savingsInfiniFiId);
			selection.append('benchmark', 'btc');

			await page.goto(`/vaults/compare?${selection}`);

			const selectedVaults = page.getByRole('list', { name: 'Selected vaults' });
			await expect(selectedVaults.locator('li')).toHaveCount(2);
			await expect(selectedVaults).toContainText('Savings USDS');
			await expect(selectedVaults).toContainText('Savings infiniFi USD');
			await expect(page.getByRole('checkbox', { name: 'BTC' })).toBeChecked();
			await expect
				.poll(() => chartRequests.at(-1))
				.toEqual({
					vaults: [savingsUsdsId, savingsInfiniFiId],
					benchmarks: ['btc']
				});

			const chart = page.locator('.comparison-chart .chart-container.boxed');
			await expect(chart).toBeVisible();
			await expect(chart.locator('canvas').first()).toBeVisible();
			const legend = page.getByLabel('Equity comparison chart legend');
			await expect(legend).toContainText('Savings USDS');
			await expect(legend).toContainText('Savings infiniFi USD');
			await expect(legend).toContainText('BTC');

			const timePeriodOptions = chart.locator('.segmented-control label');
			await expect(timePeriodOptions).toHaveText(['1M', '3M', '6M', '1Y', 'Max']);
			await timePeriodOptions.filter({ hasText: '6M' }).click();
			await expect(timePeriodOptions.filter({ hasText: '6M' })).toHaveClass(/selected/);
			await expect(selectedVaults.locator('li').first()).toContainText('16.0% CAGR');
			await expect(selectedVaults.locator('li').first()).toContainText('Since 2024-09-01');
			await timePeriodOptions.filter({ hasText: '1Y' }).click();
			await expect(timePeriodOptions.filter({ hasText: '1Y' })).toHaveClass(/selected/);
			await expect(selectedVaults.locator('li').first()).toContainText('21.0% CAGR');
			await expect(selectedVaults.locator('li').first()).toContainText('Since 2024-03-01');

			const layout = await chart.evaluate((element) => {
				const headingBounds = element.querySelector('h2')!.getBoundingClientRect();
				const controlsBounds = element.querySelector('.segmented-control')!.getBoundingClientRect();
				const plotBounds = element.querySelector('[data-testid="tv-chart"]')!.getBoundingClientRect();
				const chartBounds = element.getBoundingClientRect();
				const headingOverlapsControls = !(
					headingBounds.right <= controlsBounds.left ||
					controlsBounds.right <= headingBounds.left ||
					headingBounds.bottom <= controlsBounds.top ||
					controlsBounds.bottom <= headingBounds.top
				);
				return {
					headingOverlapsControls,
					contentLeft: headingBounds.left,
					contentRight: controlsBounds.right,
					plotLeft: plotBounds.left,
					plotRight: plotBounds.right,
					chartLeft: chartBounds.left,
					chartRight: chartBounds.right,
					viewportWidth: window.innerWidth,
					documentWidth: document.documentElement.scrollWidth
				};
			});
			expect(layout.headingOverlapsControls).toBe(false);
			expect(layout.plotLeft).toBeCloseTo(layout.contentLeft, 0);
			expect(layout.plotRight).toBeCloseTo(layout.contentRight, 0);
			expect(layout.chartLeft).toBeGreaterThanOrEqual(0);
			expect(layout.chartRight).toBeLessThanOrEqual(layout.viewportWidth);
			expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
			expect(pageErrors).toEqual([]);
		});
	}
});
