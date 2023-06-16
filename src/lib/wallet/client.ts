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
import { mainnet, polygon } from '@wagmi/core/chains';
import { publicProvider } from '@wagmi/core/providers/public';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import { w3mProvider } from '@web3modal/ethereum';

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
const connectors: Connector[] = [];
if (browser && !initialized) initWalletClient(connectors);

export function initWalletClient(connectors: Connector[]) {
	const { chains, publicClient, webSocketPublicClient } = configureChains(
		[mainnet, polygon],
		[w3mProvider({ projectId }), publicProvider()]
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

async function connectMetaMask(chainId: MaybeNumber) {
	await connect({
		chainId,
		connector: connectors.find((c) => c instanceof InjectedConnector)!
	});
}

function connectWalletConnect(chainId: MaybeNumber) {
	connect({
		chainId,
		connector: connectors.find((c) => c instanceof WalletConnectConnector)!
	});
}

export const wallet = { subscribe, connectMetaMask, connectWalletConnect, disconnect };
