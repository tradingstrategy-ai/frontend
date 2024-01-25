import { rpcUrls, walletConnectConfig } from '$lib/config';
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { GetAccountReturnType } from '@wagmi/core';
import { createConfig, connect, disconnect, fallback, http, watchAccount, reconnect } from '@wagmi/core';
import { injected } from '@wagmi/connectors';
import { mainnet, polygon } from '@wagmi/core/chains';
import type { Transport } from 'viem';
// import { w3mProvider } from '@web3modal/ethereum';

const { projectId } = walletConnectConfig;

export type ConnectedWallet = GetAccountReturnType & {
	status: 'connected';
};

export type UnConnectedWallet = Partial<GetAccountReturnType> & {
	status: 'connecting' | 'reconnecting' | 'disconnected';
};

export type Wallet = ConnectedWallet | UnConnectedWallet;

const connectorTypes = {
	injected: injected({ target: 'metaMask' })
	// walletConnect: walletConnect({ projectId })
} as const;
export type ConnectorType = keyof typeof connectorTypes;

const chains = [mainnet, polygon] as const;
export type ConfiguredChainId = (typeof chains)[number]['id'];

// Initialize chain-specific transports based on configured RPC URLs
const transports = chains.reduce((acc, { id }) => {
	const url = rpcUrls[id];
	acc[id] = url ? fallback([http(url), http()]) : http();
	return acc;
}, {} as Record<ConfiguredChainId, Transport>);

export const config = createConfig({
	ssr: !browser,
	chains,
	transports,
	connectors: Object.values(connectorTypes)
});

reconnect(config);

const { subscribe, set }: Writable<Wallet> = writable({ status: 'connecting' });

// TODO: watch on first subscription; stop watching on last unsub
watchAccount(config, { onChange: set });

function connectWallet(type: ConnectorType, chainId: ConfiguredChainId | undefined) {
	return connect(config, {
		chainId,
		connector: connectorTypes[type]
	});
}

function disconnectWallet() {
	return disconnect(config);
}

export const wallet = { subscribe, connect: connectWallet, disconnect: disconnectWallet };
