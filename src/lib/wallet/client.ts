import { walletConnectConfig } from '$lib/config';
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
import { arbitrum, avalanche, bsc, mainnet, polygon } from '@wagmi/core/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { w3mConnectors, w3mProvider } from '@web3modal/ethereum';

const { projectId } = walletConnectConfig;

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
if (browser && !initialized) initWalletClient();

export function initWalletClient() {
	const { chains, publicClient, webSocketPublicClient } = configureChains(
		[arbitrum, avalanche, bsc, mainnet, polygon],
		[w3mProvider({ projectId }), publicProvider()]
	);

	createConfig({
		autoConnect: true,
		connectors: w3mConnectors({ projectId, version: 1, chains }),
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

async function connectMetaMask(chainId: MaybeNumber) {
	await connect({
		chainId,
		connector: new InjectedConnector()
	});
	// NOTE: wagmi 1.x (as of 1.0.7) fails to reconnect injected wallet unless this localStorage
	// value is manually set.
	localStorage.setItem('wagmi.injected.shimDisconnect', 'true');
}

function connectWalletConnect(chainId: MaybeNumber) {
	connect({
		chainId,
		connector: new WalletConnectConnector({
			options: { projectId }
		})
	});
}

export const wallet = { subscribe, connectMetaMask, connectWalletConnect, disconnect };
