import { rpcUrls, walletConnectConfig } from '$lib/config';
import { type Writable, writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Transport } from 'viem';
import type { Connector, GetAccountReturnType } from '@wagmi/core';
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

const ssr = !browser;

const chains = [arbitrum, avalanche, bsc, mainnet, polygon] as const;
export type ConfiguredChainId = (typeof chains)[number]['id'];

// Initialize chain-specific transports based on configured RPC URLs
const transports = chains.reduce((acc, { id }) => {
	const url = rpcUrls[id];
	acc[id] = url ? fallback([http(url), http()]) : http();
	return acc;
}, {} as Record<ConfiguredChainId, Transport>);

export type ConnectorType = 'injected' | 'walletConnect';
const connectors = ssr ? [] : [injected(), walletConnect({ projectId })];

export const config = createConfig({ ssr, chains, transports, connectors });

export type Wallet = GetAccountReturnType;
export type ConnectedWallet = Wallet & { status: 'connected' };

const { subscribe, set }: Writable<Wallet> = writable(getAccount(config));
watchAccount(config, { onChange: set });
reconnect(config);

// export wallet as a readable store
export const wallet = { subscribe };

export async function connect(type: ConnectorType, chainId: ConfiguredChainId | undefined) {
	// find matching connectors by type
	const connectors = config.connectors.filter((c) => c.type === type);

	// select the second matching connector, falling back to first
	// (prefer EIP-6963 discovered connector over generic injected connector)
	const connector = connectors[1] ?? connectors[0];

	if (connector) {
		return _connect(config, { chainId, connector });
	}
}

export function disconnect() {
	return _disconnect(config);
}

export function switchChain(chainId: ConfiguredChainId) {
	return _switchChain(config, { chainId });
}
