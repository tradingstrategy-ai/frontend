import type { Page } from '@playwright/test';
import { installMockRpc } from './mock-rpc';

/** Enzyme strategy from the mock API: deposits enabled, on Polygon */
export const STRATEGY = '/strategies/enzyme-polygon-matic-usdc';
export const ADDRESS = '0x0d7786000000000000000000000000000000beef';
export const POLYGON = 137;
export const MAINNET = 1;
/** Polygon bridged USDC — the strategy's denomination token, labelled "USDC.e" by the app */
export const USDC = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';

/**
 * Upper bound for the wallet to settle: `RECONNECT_TIMEOUT` in `$lib/wallet/client` (10s) plus
 * slack for the page to react.
 */
export const RECONNECT_SETTLE_TIMEOUT = 15_000;

/** Native and token balances the fake RPC node reports, formatted as the UI shows them */
export const NATIVE_BALANCE_LABEL = '2.50';
export const TOKEN_BALANCE_LABEL = '1,234.56';

/** Fake RPC node for the strategy above with the balances above */
export function installStrategyRpc(page: Page) {
	return installMockRpc(page, {
		chainId: POLYGON,
		nativeBalance: 2_500_000_000_000_000_000n,
		token: { address: USDC, symbol: 'USDC', decimals: 6, balance: 1_234_560_000n }
	});
}
