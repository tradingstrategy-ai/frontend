import { rpcUrls, walletConnectConfig } from '$lib/config';
import { type Readable, readable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Transport } from 'viem';
import type { GetAccountReturnType } from '@wagmi/core';
import {
	createConfig,
	fallback,
	http,
	getAccount,
	watchAccount,
	reconnect,
	connect as _connect,
	disconnect as _disconnect,
	switchChain as _switchChain
} from '@wagmi/core';
import { injected, walletConnect } from '@wagmi/connectors';
import { arbitrum, avalanche, bsc, mainnet, polygon } from '@wagmi/core/chains';

const { projectId } = walletConnectConfig;

const connectorTypes = {
	injected: injected({ target: 'metaMask' }),
	walletConnect: walletConnect({ projectId })
} as const;
export type ConnectorType = keyof typeof connectorTypes;

const chains = [arbitrum, avalanche, bsc, mainnet, polygon] as const;
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
	connectors: browser ? Object.values(connectorTypes) : []
});

if (browser) reconnect(config);

export type Wallet = GetAccountReturnType;
export type ConnectedWallet = Wallet & { status: 'connected' };

export const wallet: Readable<Wallet> = readable(getAccount(config), (set) => {
	return watchAccount(config, { onChange: set });
});

export function connect(type: ConnectorType, chainId: ConfiguredChainId | undefined) {
	return _connect(config, {
		chainId,
		connector: connectorTypes[type]
	});
}

export function switchChain(chainId: ConfiguredChainId) {
	return _switchChain(config, { chainId });
}

export function disconnect() {
	return _disconnect(config);
}
