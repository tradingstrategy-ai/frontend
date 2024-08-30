// Benchmark tokens
const benchmarks = [
	// BTC benchmark: WBTC-USDC (0.3%) on Uniswap v3 on Ethereum
	// https://tradingstrategy.ai/trading-view/ethereum/uniswap-v3/wbtc-usdc-fee-30
	{
		symbol: 'BTC',
		pairId: 2697647,
		color: '#EA983D'
	},

	// ETH benchmark: ETH-USDC 0.05%Uniswap v3 on Ethereum
	// https://tradingstrategy.ai/trading-view/ethereum/uniswap-v3/eth-usdc-fee-5
	{
		symbol: 'ETH',
		pairId: 2697765,
		color: '#687DE3'
	},

	// MATIC benchmark: MATIC-USDC 0.05% on  Uniswap v3 on Polygon
	// https://tradingstrategy.ai/trading-view/polygon/uniswap-v3/matic-usdc-fee-5
	{
		symbol: 'MATIC',
		pairId: 2854997,
		color: '#6843D0'
	}
] as const;

// FIXME: using strategy id hack to infer list of tokens based on strategy ID.
// In the future this should be provided by strategy configuration.
export function getBenchmarkTokens({ id }: { id: string }) {
	const parts = id.split('-');
	return benchmarks.filter((token) => parts.includes(token.symbol.toLowerCase()));
}
