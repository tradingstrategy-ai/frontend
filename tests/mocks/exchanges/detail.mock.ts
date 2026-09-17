import { defineMock } from 'vite-plugin-mock-dev-server';

/** Unnamed factory reported by the backend with its contract address as the slug. */
export const UNKNOWN_EXCHANGE_SLUG = '0x8a31fa111f438a6071a659060e37a6fc2c86fa13';

const uniswapV3 = {
	exchange_id: 3681,
	chain_name: 'Ethereum',
	chain_slug: 'ethereum',
	exchange_slug: 'uniswap-v3',
	exchange_type: 'uniswap_v3',
	liquidity_type: 'uniswap-v3-style-concentrated-liquidity',
	human_readable_name: 'Uniswap v3',
	address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
	buy_volume_30d: 1449926922.5359044,
	buy_volume_all_time: 506837852284.0383,
	buy_count_all_time: 0,
	sell_count_all_time: 0,
	sell_volume_30d: 5342852832.230548,
	sell_volume_all_time: 1469899373230.7595,
	homepage: 'https://uniswap.org/',
	pair_count: 71237,
	active_pair_count: 2043,
	first_trade_at: null,
	blockchain_explorer_link: 'https://etherscan.io/address/0x1f98431c8ad98523631ae4a59f267346ea31f984'
};

const unknownExchange = {
	...uniswapV3,
	exchange_id: 5291,
	exchange_slug: UNKNOWN_EXCHANGE_SLUG,
	exchange_type: 'uniswap_v2',
	liquidity_type: 'xyliquidity',
	human_readable_name: 'Unknown',
	address: '0x8A31Fa111F438A6071a659060e37a6fc2C86fA13',
	homepage: null,
	pair_count: 12,
	active_pair_count: 0,
	blockchain_explorer_link: 'https://etherscan.io/address/0x8a31fa111f438a6071a659060e37a6fc2c86fa13'
};

export default defineMock({
	url: '/api/exchange-details',
	body: ({ query }) => (query.exchange_slug === UNKNOWN_EXCHANGE_SLUG ? unknownExchange : uniswapV3)
});
