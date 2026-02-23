// Custom viem chains (networks)
// see: https://rc.viem.sh/docs/chains/introduction.html#custom-chains
import { defineChain } from 'viem';

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
