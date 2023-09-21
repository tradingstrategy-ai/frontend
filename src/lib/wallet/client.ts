import { rpcUrls, walletConnectConfig } from '$lib/config';
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Chain, Connector } from '@wagmi/core';
import {
	createConfig,
	configureChains,
	connect,
	disconnect,
	watchAccount,
	watchNetwork,
	InjectedConnector
} from '@wagmi/core';
import { arbitrum, avalanche, bsc, mainnet, polygon } from 'viem/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { w3mProvider } from '@web3modal/ethereum';

const { projectId } = walletConnectConfig;

// helper function to retrive configured RPC URL by chain ID
function getRpcUrl({ id }: Chain) {
	const http = rpcUrls[id];
	return http && { http };
}

export type ConnectorType = 'Injected' | 'WalletConnect';

type CommonWallet = {
	name: string;
	address: Address;
	chain: Chain;
	connector: Connector;
};

export type ConnectedWallet = CommonWallet & {
	status: 'connected';
};

export type UnConnectedWallet = Partial<CommonWallet> & {
	status: 'disconnected' | 'connecting' | 'reconnecting';
};

export type Wallet = ConnectedWallet | UnConnectedWallet;

const { subscribe, update }: Writable<Wallet> = writable({ status: 'connecting' });

// initialize on first client-side load
let initialized = false;
const connectors: Connector[] = [];
if (browser && !initialized) initWalletClient(connectors);

function initWalletClient(connectors: Connector[]) {
	const { chains, publicClient, webSocketPublicClient } = configureChains(
		[arbitrum, avalanche, bsc, mainnet, polygon],
		[jsonRpcProvider({ rpc: getRpcUrl }), w3mProvider({ projectId }), publicProvider()]
	);

	connectors.push(new InjectedConnector());
	connectors.push(new WalletConnectConnector({ chains, options: { projectId } }));

	createConfig({
		autoConnect: true,
		connectors,
		publicClient,
		webSocketPublicClient
	});

	// TODO: watch on first subscription; stop watching on last unsub
	watchNetwork((network) => {
		update((wallet) => ({ ...wallet, chain: network?.chain }));
	});

	// TODO: watch on first subscription; stop watching on last unsub
	watchAccount(({ address, status, connector }) => {
		update(({ chain }) => {
			return {
				status,
				address,
				name: connector?.name,
				connector,
				chain: status === 'connected' ? chain : undefined
			};
		});
	});

	initialized = true;
}

function connectWallet(type: ConnectorType, chainId: MaybeNumber) {
	return connect({
		chainId,
		connector: connectors.find((c) => c.constructor.name === `${type}Connector`)!
	});
}

export const wallet = { subscribe, connect: connectWallet, disconnect };
