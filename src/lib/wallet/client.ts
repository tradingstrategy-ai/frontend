import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
	createClient,
	configureChains,
	connect,
	disconnect,
	getNetwork,
	watchNetwork,
	InjectedConnector
} from '@wagmi/core';
import { arbitrum, avalanche, bsc, mainnet, polygon } from '@wagmi/core/chains';
import { publicProvider } from '@wagmi/core/providers/public';

// TODO: type defs for connector, account, chain
interface Wallet {
	connected: boolean;
	name?: 'MetaMask' | 'WalletConnect';
	slug?: 'metamask' | 'walletconnect';
	account?: string;
	chain?: any;
	connector?: any;
}

const disconnectedWallet = { connected: false };
const { subscribe, set, update }: Writable<Wallet> = writable(disconnectedWallet);

let initialized = false;

export function initWalletClient() {
	if (!browser || initialized) return;

	// { chains } also available
	const { provider, webSocketProvider } = configureChains(
		[arbitrum, avalanche, bsc, mainnet, polygon],
		[publicProvider()]
	);

	createClient({
		// autoConnect: true,
		// connectors: [ new InjectedConnector({ chains })],
		provider,
		webSocketProvider
	});

	// TODO: watch on first subscription; stop watching on last unsub
	watchNetwork((network) => {
		update((wallet) => ({ ...wallet, chain: network?.chain }));
	});

	initialized = true;
}

async function connectMetaMask() {
	const { account, connector } = await connect({
		connector: new InjectedConnector()
	});

	const { chain } = getNetwork();

	set({
		connected: true,
		name: 'MetaMask',
		slug: 'metamask',
		account,
		chain,
		connector
	});
}

// STUB WalletConnect for now
async function connectWalletConnect() {
	const { account, connector } = await connect({
		connector: new InjectedConnector()
	});

	const { chain } = getNetwork();

	set({
		connected: true,
		name: 'WalletConnect',
		slug: 'walletconnect',
		account,
		chain,
		connector
	});
}

function disconnectWallet() {
	set(disconnectedWallet);
	disconnect();
}

export const wallet = {
	subscribe,
	connectMetaMask,
	connectWalletConnect,
	disconnect: disconnectWallet
};
