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
import { metaMask } from '@wagmi/connectors';
import { arbitrum, mainnet, polygon } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import metaMaskIcon from '$lib/assets/logos/wallets/metamask.svg';

const { projectId } = walletConnectConfig;

// AppKit and MetaMask metadata
const iconUrl = 'https://tradingstrategy.ai/brand-mark-100x100.png';
const metadata = {
	name: 'Trading Strategy',
	description: 'Unleash the power of automated crypto trading',
	url: 'https://tradingstrategy.ai',
	icons: [iconUrl],
	iconUrl
};

// Feature Trust Wallet in AppKit modal
// see: https://explorer.walletconnect.com
const featuredWalletIds = ['4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'];

// Initialize chains that should be available to wallet
const chains = [arbitrum, mainnet, polygon] as const;
export type ConfiguredChain = (typeof chains)[number];
export type ConfiguredChainId = ConfiguredChain['id'];

// Initialize chain-specific transports based on configured RPC URLs
const transports: Record<number, Transport> = {};
chains.forEach(({ id }) => {
	const url = rpcUrls[id];
	transports[id] = url ? fallback([http(url), http()]) : http();
});

// Create AppKit wagmi adapter and export wagmi config
// (custom MetaMask connector required to support MetaMask on mobile devices)
const wagmiAdapter = new WagmiAdapter({
	projectId,
	transports,
	networks: [...chains],
	connectors: [metaMask({ dappMetadata: metadata })],
	ssr: !browser
});
export const config = wagmiAdapter.wagmiConfig;

// Create and export AppKit modal
export const modal = createAppKit({
	projectId,
	metadata,
	adapters: [wagmiAdapter],
	networks: [...chains],
	connectorImages: { metaMaskSDK: metaMaskIcon },
	featuredWalletIds,
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
 * Request wallet to switch to a different chain id
 */
export function switchChain(chainId: number) {
	return _switchChain(config, { chainId });
}

/**
 * Disconnect the user's wallet
 */
export function disconnect() {
	_disconnect(config);
}
