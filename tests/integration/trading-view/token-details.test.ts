import { expect, test } from '@playwright/test';
import { ILLIQUID_TOKEN_ADDRESS } from '../../mocks/tokens/fixtures';

const LIQUID_TOKEN_PATH = 'trading-view/ethereum/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const ILLIQUID_TOKEN_PATH = `trading-view/ethereum/tokens/${ILLIQUID_TOKEN_ADDRESS}`;
const robotsMeta = 'head meta[name="robots"]';

test.describe('token details page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(LIQUID_TOKEN_PATH);
	});

	test('should be indexable when the token has liquidity', async ({ page }) => {
		await expect(page.locator(robotsMeta)).toHaveCount(0);
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
		const selector = '[data-testid="pairs-table"] :not(.loading) tbody';
		// wait for data to load client-side
		await page.waitForSelector(`${selector} .pair_symbol`);
		const rows = page.locator(`${selector} tr`);
		expect(await rows.count()).toBe(10);
		const rowData = ['ETH-USDC', 'Uniswap v3', '\\$1.50K', '▲ 11.2%', '\\$7.89B', '\\$165.50M'];
		await expect(rows.first()).toHaveText(new RegExp(rowData.join('.*')));
	});

	test('clicking trading pair should navagate to pair details page', async ({ page }) => {
		const selector = '[data-testid="pairs-table"] :not(.loading) tbody tr';
		// wait for datatables to load data (client-side)
		const tableRow = await page.waitForSelector(selector);
		await tableRow.click();
		await expect(page).toHaveURL('trading-view/ethereum/uniswap-v3/eth-usdc-fee-5');
	});

	test('should mark tokens without liquidity or volume as noindex', async ({ page }) => {
		await page.goto(ILLIQUID_TOKEN_PATH);
		await expect(page.getByTestId('token-info')).toContainText('Name Dead Token');
		await expect(page.locator(robotsMeta)).toHaveAttribute('content', 'noindex,follow');
	});

	test('should update the robots tag on client-side navigation between tokens', async ({ page }) => {
		await expect(page.locator(robotsMeta)).toHaveCount(0);

		// SvelteKit intercepts same-origin anchor clicks, so this navigates client-side
		await page.evaluate((href) => {
			document.body.insertAdjacentHTML('beforeend', `<a id="illiquid-token-link" href="${href}">dead</a>`);
		}, `/${ILLIQUID_TOKEN_PATH}`);
		await page.locator('#illiquid-token-link').click();

		await expect(page).toHaveURL(ILLIQUID_TOKEN_PATH);
		await expect(page.getByTestId('token-info')).toContainText('Name Dead Token');
		await expect(page.locator(robotsMeta)).toHaveAttribute('content', 'noindex,follow');
	});
});
