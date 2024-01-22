import { rpcUrls, walletConnectConfig } from '$lib/config';
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { GetAccountReturnType } from '@wagmi/core';
import { type Config, createConfig, connect, disconnect, http, watchAccount, reconnect } from '@wagmi/core';
import { injected } from '@wagmi/connectors';
import { type Chain, mainnet, polygon } from '@wagmi/core/chains';
// import { w3mProvider } from '@web3modal/ethereum';

const { projectId } = walletConnectConfig;

// helper function to retrive configured RPC URL by chain ID
function getRpcUrl({ id }: Chain) {
	const http = rpcUrls[id];
	return http && { http };
}

export type ConnectedWallet = GetAccountReturnType & {
	status: 'connected';
};

export type UnConnectedWallet = Partial<GetAccountReturnType> & {
	status: 'connecting' | 'reconnecting' | 'disconnected';
};

export type Wallet = ConnectedWallet | UnConnectedWallet;

const connectorTypes = {
	injected: injected()
	// walletConnect: walletConnect({ projectId })
} as const;

export type ConnectorType = keyof typeof connectorTypes;

const { subscribe, set }: Writable<Wallet> = writable({ status: 'connecting' });

let config: Config | undefined;

// initialize on first client-side load
let initialized = false;
if (browser && !initialized) initWalletClient();

function initWalletClient() {
	config = createConfig({
		chains: [mainnet, polygon],

		// TODO: configure connectors based on RPC URLs
		// old code (from configureChains call):
		// [jsonRpcProvider({ rpc: getRpcUrl }), w3mProvider({ projectId }), publicProvider()]
		// see https://wagmi.sh/core/api/transports
		// or consider using viem createClient (https://wagmi.sh/core/api/createConfig)
		transports: {
			[mainnet.id]: http(),
			[polygon.id]: http()
		},

		connectors: Object.values(connectorTypes)
	});

	reconnect(config);

	// TODO: watch on first subscription; stop watching on last unsub
	watchAccount(config, { onChange: set });

	initialized = true;
}

function connectWallet(type: ConnectorType, chainId: number | undefined) {
	return connect(config!, {
		chainId,
		connector: connectorTypes[type]
	});
}

export const wallet = { config, subscribe, connect: connectWallet, disconnect };
