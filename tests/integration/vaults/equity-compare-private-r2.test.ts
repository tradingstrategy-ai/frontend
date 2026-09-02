import { expect, test } from '@playwright/test';
import { hasPrivateR2Secrets } from '../../helpers';

const hasSecrets = hasPrivateR2Secrets('test', 'local');

test.describe('live vault equity curve comparison', () => {
	test.skip(!hasSecrets, 'Private R2 secrets are not configured for integration tests');

	test('compares Hyperliquid HLP and Spark with BTC, ETH and US Treasury', async ({ page, request }) => {
		test.setTimeout(120_000);

		type LiveSearchResult = {
			name: string;
			vaultId?: string;
			protocolName?: string;
			chainName?: string;
		};
		const searchVaults = async (query: string): Promise<LiveSearchResult[]> => {
			const response = await request.get('/search/suggestions', {
				params: { q: query, scope: 'vaults', limit: 20 }
			});
			expect(response.status()).toBe(200);
			return ((await response.json()) as { results: LiveSearchResult[] }).results;
		};

		const hlp = (await searchVaults('Hyperliquid HLP')).find(
			(result) => result.name === 'Hyperliquidity Provider (HLP)'
		);
		const spark = (await searchVaults('Spark vault')).find(
			(result) =>
				result.name === 'Spark USDC Vault' && result.protocolName === 'Spark' && result.chainName === 'Ethereum'
		);
		expect(hlp?.vaultId).toBeTruthy();
		expect(spark?.vaultId).toBeTruthy();

		const chartResponsePromise = page.waitForResponse((response) => {
			const url = new URL(response.url());
			return url.pathname === '/vaults/compare/chart-data' && url.searchParams.getAll('vault').length === 2;
		});

		const selection = new URLSearchParams();
		selection.append('vault', hlp!.vaultId!);
		selection.append('vault', spark!.vaultId!);
		selection.append('benchmark', 'treasury');
		selection.append('benchmark', 'eth');
		selection.append('benchmark', 'btc');
		await page.goto(`/vaults/compare?${selection}`);

		const chartResponse = await chartResponsePromise;
		expect(chartResponse.status()).toBe(200);
		const chartData = (await chartResponse.json()) as {
			vaultSeries: { id: string; points: { '4h': unknown[]; '1d': unknown[] } }[];
			benchmarkSeries: { id: string; points: { '4h': unknown[]; '1d': unknown[] } }[];
			missingVaultIds: string[];
		};
		expect(chartData.vaultSeries).toHaveLength(2);
		expect(chartData.vaultSeries.map(({ id }) => id)).toEqual([hlp!.vaultId, spark!.vaultId]);
		expect(chartData.vaultSeries.every(({ points }) => points['1d'].length > 0)).toBe(true);
		expect(chartData.benchmarkSeries.map(({ id }) => id)).toEqual(['treasury', 'eth', 'btc']);
		expect(chartData.benchmarkSeries.every(({ points }) => points['1d'].length > 0)).toBe(true);
		expect(chartData.missingVaultIds).toEqual([]);

		const selectedVaults = page.getByRole('list', { name: 'Selected vaults' });
		await expect(selectedVaults.locator('li')).toHaveCount(2);
		await expect(selectedVaults).toContainText('Hyperliquidity Provider (HLP)');
		await expect(selectedVaults).toContainText('Spark USDC Vault');

		await expect(page.getByRole('checkbox', { name: 'T-Bill' })).toBeChecked();
		await expect(page.getByRole('checkbox', { name: 'ETH' })).toBeChecked();
		await expect(page.getByRole('checkbox', { name: 'BTC' })).toBeChecked();
		expect(new URL(page.url()).searchParams.getAll('benchmark')).toEqual(['treasury', 'eth', 'btc']);

		const legend = page.getByLabel('Equity comparison chart legend');
		await expect(legend).toContainText('Hyperliquidity Provider (HLP)');
		await expect(legend).toContainText('Spark USDC Vault');
		await expect(legend).toContainText('US 3M T-bill');
		await expect(legend).toContainText('ETH');
		await expect(legend).toContainText('BTC');
	});
});
