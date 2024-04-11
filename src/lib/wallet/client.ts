import { rpcUrls, walletConnectConfig } from '$lib/config';
import { type Writable, writable } from 'svelte/store';
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
	disconnect as _disconnect,
	switchChain as _switchChain
} from '@wagmi/core';
import { injected, walletConnect } from '@wagmi/connectors';
import { arbitrum, avalanche, bsc, mainnet, polygon } from '@wagmi/core/chains';
import { createWeb3Modal } from '@web3modal/wagmi';

const { projectId } = walletConnectConfig;

const ssr = !browser;

const chains = [arbitrum, avalanche, bsc, mainnet, polygon] as const;
export type ConfiguredChain = (typeof chains)[number];
export type ConfiguredChainId = ConfiguredChain['id'];

// Initialize chain-specific transports based on configured RPC URLs
const transports = chains.reduce((acc, { id }) => {
	const url = rpcUrls[id];
	acc[id] = url ? fallback([http(url), http()]) : http();
	return acc;
}, {} as Record<ConfiguredChainId, Transport>);

const connectors = ssr ? [] : [walletConnect({ projectId, showQrModal: false }), injected()];

export const config = createConfig({ ssr, chains, transports, connectors });

export type Wallet = GetAccountReturnType;
export type ConnectedWallet = Wallet & { status: 'connected' };

const { subscribe, set }: Writable<Wallet> = writable(getAccount(config));
watchAccount(config, { onChange: set });
reconnect(config);

// export wallet as a readable store
export const wallet = { subscribe };

export const modal = createWeb3Modal({
	wagmiConfig: config,
	projectId
});

export function disconnect() {
	return _disconnect(config);
}

export function getChain(chainId: MaybeNumber) {
	return chains.find(({ id }) => id === chainId);
}

export function switchChain(chainId: ConfiguredChainId) {
	return _switchChain(config, { chainId });
}
