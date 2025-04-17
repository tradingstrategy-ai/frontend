export class BenchmarkToken {
	symbol!: string;
	pairId!: string;
	exchangeType!: string;
	color!: string;

	loading? = $state(false);
	periodPerformance?: number | undefined = $state();

	constructor(data: BenchmarkToken) {
		Object.assign(this, data);
	}
}

// Curated list of available benchmark tokens (BTC, ETH, MATIC)
const benchmarkTokens: BenchmarkToken[] = [
	// BTC benchmark: WBTC-USDC (0.3%) on Uniswap v3 on Ethereum
	// https://tradingstrategy.ai/trading-view/ethereum/uniswap-v3/wbtc-usdc-fee-30
	{
		symbol: 'BTC',
		pairId: '2697647',
		exchangeType: 'uniswap_v3',
		color: 'rgb(234 152 61 / 50%)'
	},

	// ETH benchmark: ETH-USDC 0.05% Uniswap v3 on Ethereum
	// https://tradingstrategy.ai/trading-view/ethereum/uniswap-v3/eth-usdc-fee-5
	{
		symbol: 'ETH',
		pairId: '2697765',
		exchangeType: 'uniswap_v3',
		color: 'rgb(104 125 227 / 50%)'
	},

	// MATIC benchmark: MATIC-USDC 0.05% on  Uniswap v3 on Polygon
	// https://tradingstrategy.ai/trading-view/polygon/uniswap-v3/matic-usdc-fee-5
	{
		symbol: 'MATIC',
		pairId: '2854997',
		exchangeType: 'uniswap_v3',
		color: 'rgb(104 67 208 / 50%)'
	}
];

// FIXME: using strategy id hack to infer list of tokens based on strategy ID.
// In the future this should be provided by strategy configuration.
export function getBenchmarkTokens({ id }: { id: string }): BenchmarkToken[] {
	const parts = id.split('-');
	const tokens = benchmarkTokens.filter((token) => parts.includes(token.symbol.toLowerCase()));
	return tokens.map((t) => new BenchmarkToken(t));
}
