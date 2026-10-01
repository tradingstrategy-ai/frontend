import { expect, test } from '@playwright/test';
import type { HistoricalTvlPayload } from '../../../src/lib/echarts/historical-tvl';
import type { HistoricalTvlByAssetTypePayload } from '../../../src/lib/echarts/historical-tvl-asset-type';
import { vaultChartLinks } from '../../../src/lib/top-vaults/vault-chart-links';
import { waitForHydration } from '../helpers';

test('historical asset type payload splits the full TVL into two categories', async ({ request }) => {
	const response = await request.get('/vaults/historical-tvl-asset-type/chart-data');
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toContain('application/json');
	expect(response.headers()['cache-control']).toBe('public, max-age=86400');
	const payload = (await response.json()) as HistoricalTvlByAssetTypePayload;
	expect(payload.current.series.map((series) => series.key)).toEqual(['tokenised-funds', 'vaults']);
	expect(payload.current.totalTvl).toBe(payload.current.series.reduce((total, series) => total + series.tvl, 0));
	expect(Number.isNaN(Date.parse(payload.current.asOf))).toBe(false);
	const chainResponse = await request.get('/vaults/historical-tvl-chain/chart-data');
	expect(chainResponse.status()).toBe(200);
	const chainPayload = (await chainResponse.json()) as HistoricalTvlPayload;

	for (const source of [undefined, 'daily'] as const) {
		const data = source ? payload[source]! : payload;
		const chainData = source ? chainPayload[source]! : chainPayload;
		expect(data.weeks.length).toBeGreaterThan(0);
		expect(data.weeks).toEqual(chainData.weeks);
		expect(data.series.map((series) => series.key)).toEqual(['tokenised-funds', 'vaults']);
		for (const series of data.series) {
			expect(series.values).toHaveLength(data.weeks.length);
			expect(series.values.at(-1)).toBeGreaterThan(0);
		}
		for (const [index] of data.weeks.entries()) {
			expect(data.series.reduce((sum, series) => sum + series.values[index], 0)).toBeCloseTo(
				chainData.series.reduce((sum, series) => sum + series.values[index], 0),
				2
			);
		}
	}
});

test('renders the fund and vault chart with navigation and share/history controls', async ({ page }) => {
	await page.goto('/vaults/historical-tvl-asset-type');
	await expect(page.locator('h1')).toHaveText('Tokenised funds vs. vaults TVL');
	await waitForHydration(page);
	const chart = page.getByTestId('vault-scatter-plot');
	await expect(chart.locator('.chart-canvas canvas')).toBeVisible({ timeout: 15000 });
	await expect(chart.locator('.group-chip')).toHaveText(['Tokenised funds', 'Vaults']);
	await expect(page.getByTestId('asset-type-current-tvl')).toContainText('Latest reported TVL');
	await expect(chart.locator('.chart-summary')).toContainText('weekly average');
	await expect(chart.locator('.chart-summary')).not.toContainText('Today');
	const selector = page.locator('.scatter-plot-selector');
	await expect(selector.locator('a')).toHaveCount(vaultChartLinks.length);
	await expect(selector.locator('a.active')).toHaveText('Tokenised funds vs. vaults TVL');

	await chart.locator('label', { hasText: 'Market share' }).click();
	await expect(page).toHaveURL(/chart=market-share/);
	await chart.locator('label', { hasText: '3m' }).click();
	await expect(page).toHaveURL(/history=3m/);
	await page.reload();
	await expect(chart.locator('input[value="market-share"]')).toBeChecked();
	await expect(chart.locator('input[value="3m"]')).toBeChecked();
	await expect(chart.locator('.chart-canvas canvas')).toBeVisible({ timeout: 15000 });
	await expect(chart.locator('.chart-summary')).toContainText('As of');
	await expect(chart.locator('.chart-summary')).not.toContainText('weekly average');
});
