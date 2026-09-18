import type { Page, Route } from '@playwright/test';
import {
	decodeFunctionData,
	encodeFunctionResult,
	erc20Abi,
	multicall3Abi,
	numberToHex,
	parseAbi,
	toFunctionSelector,
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

/** Set `MOCK_RPC_DEBUG=1` to log every intercepted request and the canned answer */
const DEBUG = Boolean(process.env.MOCK_RPC_DEBUG);

/** Multicall3 is deployed at the same address on every chain viem knows about */
const MULTICALL3 = '0xca11bde05977b3631167028862be2a173976ca11';

/** ABI fragments of everything the strategy page and deposit wizard read on-chain */
const vaultAbi = parseAbi([
	// Enzyme ComptrollerLib
	'function getDenominationAsset() view returns (address)',
	// Enzyme FundValueCalculator
	'function calcNetValueForSharesHolder(address vault, address holder) returns (address, uint256)',
	'function calcGrossShareValue(address vault) returns (address, uint256)',
	// TermedVaultUSDCPaymentForwarder
	'function isTermsOfServiceEnabled() view returns (bool)',
	// Multicall3 helper wagmi's `getBalance` uses when the client batches calls through multicall
	'function getEthBalance(address addr) view returns (uint256)'
]);

/**
 * Intercept every JSON-RPC request the page makes to any host other than the test server and
 * answer it from a canned in-memory "chain", so wallet-connected pages render deterministically
 * without touching a public RPC.
 *
 * Why this exists: once a wallet is connected, the strategy page and the deposit wizard read the
 * user's balances through wagmi's public client (`readContract(s)`, `getBalance`, `simulateContract`).
 * AppKit's wagmi adapter sends those to `rpc.walletconnect.org` (or the chain's default RPC), which
 * is off-limits in CI. Aborting the requests is not enough: a `+page.ts` load that throws renders
 * the error page, so the tests could not tell "the wallet was handled correctly" apart from "the
 * RPC was unreachable".
 *
 * The node understands the handful of read paths the app uses:
 *
 * - `eth_chainId`, `eth_blockNumber`, `eth_gasPrice`, `eth_estimateGas` — constants
 * - `eth_getBalance` and Multicall3 `getEthBalance(address)` — `nativeBalance`
 * - `eth_call` to Multicall3 `aggregate3` — decoded and answered call by call (wagmi batches
 *   `readContracts` this way)
 * - `eth_call` to any other contract — answered by function selector (ERC-20 metadata/balance,
 *   Enzyme comptroller and value calculator)
 *
 * Unknown selectors return `execution reverted`, which viem maps to a contract error and which
 * `readContracts({ allowFailure: true })` tolerates. Non-JSON-RPC requests to external hosts are
 * still aborted.
 */
export async function installMockRpc(page: Page, options: MockRpcOptions): Promise<void> {
	const { chainId, nativeBalance, token } = options;

	/** Answer a single contract call by its 4-byte selector */
	function call(data: Hex): Hex | undefined {
		const selector = data.slice(0, 10).toLowerCase();

		const is = (signature: string) => selector === toFunctionSelector(signature).toLowerCase();

		if (is('function decimals()')) {
			return encodeFunctionResult({ abi: erc20Abi, functionName: 'decimals', result: token.decimals });
		}
		if (is('function symbol()')) {
			return encodeFunctionResult({ abi: erc20Abi, functionName: 'symbol', result: token.symbol });
		}
		if (is('function name()')) {
			return encodeFunctionResult({ abi: erc20Abi, functionName: 'name', result: `${token.symbol} token` });
		}
		if (is('function balanceOf(address)')) {
			return encodeFunctionResult({ abi: erc20Abi, functionName: 'balanceOf', result: token.balance });
		}
		if (is('function allowance(address,address)')) {
			return encodeFunctionResult({ abi: erc20Abi, functionName: 'allowance', result: 0n });
		}
		if (is('function getDenominationAsset()')) {
			return encodeFunctionResult({ abi: vaultAbi, functionName: 'getDenominationAsset', result: token.address });
		}
		if (is('function calcNetValueForSharesHolder(address,address)')) {
			return encodeFunctionResult({
				abi: vaultAbi,
				functionName: 'calcNetValueForSharesHolder',
				result: [token.address, 0n]
			});
		}
		if (is('function calcGrossShareValue(address)')) {
			return encodeFunctionResult({
				abi: vaultAbi,
				functionName: 'calcGrossShareValue',
				result: [token.address, 10n ** BigInt(token.decimals)]
			});
		}
		if (is('function getEthBalance(address)')) {
			return encodeFunctionResult({ abi: vaultAbi, functionName: 'getEthBalance', result: nativeBalance });
		}
		if (is('function isTermsOfServiceEnabled()')) {
			return encodeFunctionResult({ abi: vaultAbi, functionName: 'isTermsOfServiceEnabled', result: false });
		}
		return undefined;
	}

	/** Answer one JSON-RPC request object; returns the `result` or an `error` payload */
	function handle(
		method: string,
		params: unknown[]
	): { result: unknown } | { error: { code: number; message: string } } {
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

				// wagmi's readContracts batches through Multicall3; answer each inner call separately
				if (to?.toLowerCase() === MULTICALL3) {
					const { args } = decodeFunctionData({ abi: multicall3Abi, data });
					const calls = args[0] as { target: Address; allowFailure: boolean; callData: Hex }[];
					const results = calls.map(({ callData }) => {
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

	await page.route(
		(url) => url.hostname !== '127.0.0.1',
		async (route: Route) => {
			type RpcRequest = { id: number; method: string; params?: unknown[] };
			const isJsonRpc = (value: unknown): value is RpcRequest =>
				typeof value === 'object' && value !== null && 'jsonrpc' in value;

			const request = route.request();
			const body: unknown = request.method() === 'POST' ? request.postDataJSON() : undefined;

			// only JSON-RPC traffic is served; everything else external (AppKit config, analytics) is
			// dropped so the test never depends on the network
			if (!(isJsonRpc(body) || (Array.isArray(body) && body.every(isJsonRpc)))) {
				if (DEBUG) console.log('RPC abort', request.method(), request.url());
				return route.abort();
			}

			const respond = ({ id, method, params = [] }: RpcRequest) => ({ jsonrpc: '2.0', id, ...handle(method, params) });
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
