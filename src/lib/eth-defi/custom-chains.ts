// Custom viem chains (networks)
// see: https://rc.viem.sh/docs/chains/introduction.html#custom-chains
import { defineChain } from 'viem';

// HyperEVM
export const hyperEvm = defineChain({
	id: 999,
	name: 'HyperEVM',
	nativeCurrency: {
		name: 'HYPE',
		symbol: 'HYPE',
		decimals: 18
	},
	rpcUrls: {
		default: {
			http: ['https://rpc.hyperliquid.xyz/evm']
		}
	},
	blockExplorers: {
		default: {
			name: 'HyperEVM Explorer',
			url: 'https://hyperevmscan.io'
		}
	}
});

// Derive
export const derive = defineChain({
	id: 957,
	name: 'Derive',
	nativeCurrency: {
		name: 'Ether',
		symbol: 'ETH',
		decimals: 18
	},
	blockTime: 200,
	rpcUrls: {
		default: {
			http: ['https://rpc.derive.xyz']
		}
	},
	blockExplorers: {
		default: {
			name: 'Derive Explorer',
			url: 'https://explorer.derive.xyz',
			apiUrl: 'https://explorer.derive.xyz/api'
		}
	}
});
