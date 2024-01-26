import { rpcUrls, walletConnectConfig } from '$lib/config';
import { type Readable, readable } from 'svelte/store';
import { browser } from '$app/environment';
import type { GetAccountReturnType } from '@wagmi/core';
import {
	createConfig,
	connect as _connect,
	disconnect as _disconnect,
	fallback,
	http,
	getAccount,
	watchAccount,
	reconnect
} from '@wagmi/core';
import { injected } from '@wagmi/connectors';
import { mainnet, polygon } from '@wagmi/core/chains';
import type { Transport } from 'viem';
// import { w3mProvider } from '@web3modal/ethereum';

const { projectId } = walletConnectConfig;

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

export type Wallet = GetAccountReturnType;

export const wallet: Readable<Wallet> = readable(getAccount(config), (set) => {
	return watchAccount(config, { onChange: set });
});

export function connect(type: ConnectorType, chainId: ConfiguredChainId | undefined) {
	return _connect(config, {
		chainId,
		connector: connectorTypes[type]
	});
}

export function disconnect() {
	return _disconnect(config);
}
