import { expect, test } from '@playwright/test';

test.describe('token details page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('trading-view/ethereum/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
	});

	test('should include token info', async ({ page }) => {
		const tokenInfo = page.getByTestId('token-info');
		await expect(tokenInfo).toContainText('Name Wrapped Ether');
		await expect(tokenInfo).toContainText('Token symbol WETH');
		await expect(tokenInfo).toContainText('Total supply 4,005,054 WETH');
		await expect(tokenInfo).toContainText('Standard ERC-20');
		await expect(tokenInfo).toContainText('Available liquidity $633.08M');
		await expect(tokenInfo).toContainText('Volume 24h $829.72M');
		await expect(tokenInfo).toContainText('Blockchain Ethereum');
		await expect(tokenInfo).toContainText(
			'The token smart contract address is 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
		);
	});

	test('should include trading pairs data table', async ({ page }) => {
		const selector = '[data-testid="trading-pairs"] tbody';
		// wait for datatables to load data (client-side)
		await page.waitForSelector(`${selector} .col-pair`);
		const rows = page.locator(`${selector} tr`);
		expect(await rows.count()).toBeGreaterThanOrEqual(10);
		const rowData = ['ETH-USDC', 'Uniswap v3', '$1.50k', '▲11.2%', '$7.89B', '$0', '▼0.0%'];
		await expect(rows.first()).toHaveText(rowData.join(''));
	});

	test('clicking trading pair should navagate to pair details page', async ({ page }) => {
		const selector = '[data-testid="trading-pairs"] tbody .col-pair';
		// wait for datatables to load data (client-side)
		const tableCell = await page.waitForSelector(selector);
		await tableCell.click();
		await expect(page).toHaveURL('trading-view/ethereum/uniswap-v3/eth-usdc-fee-5');
	});
});
