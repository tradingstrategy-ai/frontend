import type { GetAccountReturnType, Transport } from '@wagmi/core';
import { type Writable, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { rpcUrls, walletConnectConfig } from '$lib/config';
import {
	fallback,
	http,
	getAccount,
	watchAccount,
	reconnect,
	disconnect as _disconnect,
	switchChain as _switchChain
} from '@wagmi/core';
import { arbitrum, mainnet, polygon } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const { projectId } = walletConnectConfig;

// AppKit metadata
const metadata = {
	name: 'Trading Strategy',
	description: 'Unleash the power of automated crypto trading',
	url: 'https://tradingstrategy.ai/',
	icons: ['https://tradingstrategy.ai/brand-mark-100x100.png']
};

// Initialize chains that should be available to wallet
const chains = [arbitrum, mainnet, polygon] as const;
export type ConfiguredChain = (typeof chains)[number];
export type ConfiguredChainId = ConfiguredChain['id'];

// Initialize chain-specific transports based on configured RPC URLs
const transports: Record<number, Transport> = {};
for (const { id } of chains) {
	const url = rpcUrls[id];
	transports[id] = url ? fallback([http(url), http()]) : http();
}

// Create AppKit wagmi adapter and export wagmi config
const wagmiAdapter = new WagmiAdapter({
	projectId,
	transports,
	networks: [...chains],
	ssr: !browser
});
export const config = wagmiAdapter.wagmiConfig;

// Create and export AppKit modal
export const modal = createAppKit({
	projectId,
	metadata,
	adapters: [wagmiAdapter],
	networks: [...chains],
	features: {
		analytics: true,
		email: false,
		socials: false
	}
});

// Create and export a readable wallet store
export type Wallet = GetAccountReturnType;
export type ConnectedWallet = Wallet & { status: 'connected' };

const { subscribe, set }: Writable<Wallet> = writable(getAccount(config));
watchAccount(config, { onChange: set });
reconnect(config);

export const wallet = { subscribe };

/**
 * Disconnect wallet
 */
export function disconnect() {
	return _disconnect(config);
}

/**
 * Get currently selected wallet chain
 */
export function getChain(chainId: MaybeNumber) {
	return chains.find(({ id }) => id === chainId);
}

/**
 * Switch selected wallet chain
 */
export function switchChain(chainId: ConfiguredChainId) {
	return _switchChain(config, { chainId });
}
