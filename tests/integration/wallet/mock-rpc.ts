import type { Page, Route } from '@playwright/test';
import {
	decodeFunctionData,
	encodeFunctionResult,
	erc20Abi,
	multicall3Abi,
	numberToHex,
	parseAbi,
	toFunctionSelector,
	type Abi,
	type Address,
	type Hex
} from 'viem';

/**
 * Options for the fake JSON-RPC node.
 */
export type MockRpcOptions = {
	/** Chain id every RPC endpoint reports */
	chainId: number;
	/** Native currency balance (wei) returned for any address */
	nativeBalance: bigint;
	/** Denomination token (e.g. USDC) of the mocked vault */
	token: { address: Address; symbol: string; decimals: number; balance: bigint };
};

type RpcRequest = { id: number; method: string; params?: unknown[] };
type RpcResult = { result: unknown } | { error: { code: number; message: string } };

/** Set `MOCK_RPC_DEBUG=1` to log every intercepted request and the canned answer */
const DEBUG = Boolean(process.env.MOCK_RPC_DEBUG);

/** Multicall3 is deployed at the same address on every chain viem knows about */
const MULTICALL3 = '0xca11bde05977b3631167028862be2a173976ca11';

/** Contract reads the strategy page and deposit wizard make, besides ERC-20 */
const vaultAbi = parseAbi([
	// Multicall3 helper wagmi's `getBalance` uses when the client batches through multicall
	'function getEthBalance(address addr) view returns (uint256)',
	// Enzyme ComptrollerLib
	'function getDenominationAsset() view returns (address)',
	// Enzyme FundValueCalculator
	'function calcNetValueForSharesHolder(address vault, address holder) returns (address, uint256)',
	'function calcGrossShareValue(address vault) returns (address, uint256)',
	// TermedVaultUSDCPaymentForwarder
	'function isTermsOfServiceEnabled() view returns (bool)'
]);

/**
 * Intercept every JSON-RPC request the page makes to a host other than the test server and answer
 * it from canned values, so wallet-connected pages render without a public RPC.
 *
 * Once a wallet is connected the strategy page and the deposit wizard read the user's balances
 * through wagmi's public client, which AppKit's adapter points at `rpc.walletconnect.org`.
 * Aborting those requests is not enough: a `+page.ts` load that throws renders the error page,
 * which makes "the wallet was handled correctly" indistinguishable from "the RPC was unreachable".
 *
 * Supported: `eth_chainId`, `eth_blockNumber`, `eth_gasPrice`, `eth_estimateGas`, `eth_getBalance`,
 * and `eth_call` — both direct and batched through Multicall3 `aggregate3` (how wagmi sends
 * `readContracts`) — for the ERC-20 and vault functions listed in this file. Unknown functions
 * revert, which `readContracts({ allowFailure: true })` tolerates. Other external requests (AppKit
 * config, analytics) are aborted.
 */
export async function installMockRpc(page: Page, options: MockRpcOptions): Promise<void> {
	const { chainId, nativeBalance, token } = options;

	/** Return data for each supported contract function, keyed by 4-byte selector */
	const functions = new Map<Hex, Hex>();
	const answer = (abi: Abi, functionName: string, result: unknown) => {
		const item = abi.find((x) => x.type === 'function' && x.name === functionName);
		if (item?.type !== 'function') throw new Error(`${functionName} not in ABI`);
		functions.set(toFunctionSelector(item), encodeFunctionResult({ abi, functionName, result }));
	};
	answer(erc20Abi, 'decimals', token.decimals);
	answer(erc20Abi, 'symbol', token.symbol);
	answer(erc20Abi, 'name', `${token.symbol} token`);
	answer(erc20Abi, 'balanceOf', token.balance);
	answer(erc20Abi, 'allowance', 0n);
	answer(vaultAbi, 'getEthBalance', nativeBalance);
	answer(vaultAbi, 'getDenominationAsset', token.address);
	answer(vaultAbi, 'calcNetValueForSharesHolder', [token.address, 0n]);
	answer(vaultAbi, 'calcGrossShareValue', [token.address, 10n ** BigInt(token.decimals)]);
	answer(vaultAbi, 'isTermsOfServiceEnabled', false);

	const call = (data: Hex) => functions.get(data.slice(0, 10).toLowerCase() as Hex);

	function handle({ method, params = [] }: RpcRequest): RpcResult {
		switch (method) {
			case 'eth_chainId':
				return { result: numberToHex(chainId) };
			case 'eth_blockNumber':
				return { result: '0x1' };
			case 'eth_gasPrice':
				return { result: numberToHex(30_000_000_000n) };
			case 'eth_estimateGas':
				return { result: numberToHex(21_000n) };
			case 'eth_getBalance':
				return { result: numberToHex(nativeBalance) };
			case 'eth_call': {
				const { to, data } = params[0] as { to?: string; data?: Hex };
				if (!data) return { error: { code: -32602, message: 'mock rpc: missing call data' } };

				if (to?.toLowerCase() === MULTICALL3) {
					const decoded = decodeFunctionData({ abi: multicall3Abi, data });
					if (decoded.functionName !== 'aggregate3') {
						return { error: { code: -32000, message: `mock rpc: unsupported multicall ${decoded.functionName}` } };
					}
					const results = decoded.args[0].map(({ callData }) => {
						const returnData = call(callData);
						return { success: returnData !== undefined, returnData: returnData ?? '0x' };
					});
					return { result: encodeFunctionResult({ abi: multicall3Abi, functionName: 'aggregate3', result: results }) };
				}

				const result = call(data);
				return result ? { result } : { error: { code: -32000, message: 'execution reverted' } };
			}
			default:
				return { error: { code: -32601, message: `mock rpc: unsupported method ${method}` } };
		}
	}

	const isJsonRpc = (value: unknown): value is RpcRequest =>
		typeof value === 'object' && value !== null && 'jsonrpc' in value;

	await page.route(
		(url) => url.hostname !== '127.0.0.1',
		async (route: Route) => {
			const request = route.request();
			const body: unknown = request.method() === 'POST' ? request.postDataJSON() : undefined;

			if (!(isJsonRpc(body) || (Array.isArray(body) && body.every(isJsonRpc)))) {
				if (DEBUG) console.log('RPC abort', request.method(), request.url());
				return route.abort();
			}

			const respond = (rpc: RpcRequest) => ({ jsonrpc: '2.0', id: rpc.id, ...handle(rpc) });
			const payload = Array.isArray(body) ? body.map(respond) : respond(body);
			if (DEBUG)
				console.log(
					'RPC',
					request.url(),
					JSON.stringify(body).slice(0, 300),
					'=>',
					JSON.stringify(payload).slice(0, 300)
				);

			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
		}
	);
}
