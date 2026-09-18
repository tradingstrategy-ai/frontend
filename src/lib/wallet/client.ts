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
import { arbitrum, base, bsc, mainnet, polygon } from '@reown/appkit/networks';
import { derive, hyperEvm } from '$lib/eth-defi/custom-chains';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import metaMaskIcon from '$lib/assets/logos/wallets/metamask.svg';
import { errorCausedBy } from '$lib/eth-defi/helpers';

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
const chains = [arbitrum, base, bsc, mainnet, polygon, derive, hyperEvm] as const;
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

/**
 * How long to wait for `reconnect()` to finish before forcing the wallet into a settled state.
 * Injected wallets answer in milliseconds (a cold Chrome MV3 service worker in a few hundred);
 * WalletConnect session restores can take a few seconds.
 */
export const RECONNECT_TIMEOUT = 10_000;

const { subscribe, set }: Writable<Wallet> = writable(getAccount(config));
watchAccount(config, { onChange: set });

export const wallet = { subscribe };

/**
 * Resolves once the wallet has reached a settled status (`connected` or `disconnected`) after the
 * page-load reconnect — either because wagmi finished, or because `RECONNECT_TIMEOUT` elapsed and
 * the state was forced (see `settleStalledReconnect`).
 *
 * `$wallet.status` is `connecting`/`reconnecting` until then, and during that window wagmi still
 * reports the *persisted* address (see `getAccount()`): enough for public reads, but not for
 * signing. Code that must decide "is the user connected or not" (the wizard's step guard, for
 * instance) awaits this promise so that "not connected yet" is not mistaken for "not connected".
 * Resolves immediately on the server, where there is no wallet.
 */
export const walletSettled: Promise<void> = startReconnect();

/**
 * Restore a persisted wallet session and return a promise for `walletSettled`.
 *
 * wagmi persists the last connection to storage with a partial connector (`{ id, name, type,
 * uid }`, no methods) and `reconnect()` swaps a live connector in. Two things can go wrong, both
 * of which left the app permanently half-connected before this existed:
 *
 * - the wallet's provider never answers `eth_accounts` (hung extension): `reconnect()` awaits it
 *   forever, `status` stays `reconnecting`/`connecting`, the stub stays under `state.current`,
 *   `getAccount()` keeps reporting the persisted address and any write fails with the opaque
 *   `connector.getChainId is not a function`;
 * - AppKit's wagmi adapter *also* calls `reconnect()` (its `syncConnections()`), and wagmi guards
 *   the action with a module-level `isReconnecting` flag, so whichever call comes second is a
 *   silent no-op. Ours runs first because AppKit initialises asynchronously; nothing here relies
 *   on the order beyond that.
 *
 * Note: whether `status` becomes `connecting` or `reconnecting` depends on a race — wagmi's
 * persisted state is hydrated asynchronously, so `reconnect()` may start before `state.current`
 * is restored. Code below therefore never keys on one of the two.
 */
function startReconnect(): Promise<void> {
	if (!browser) return Promise.resolve();

	reconnect(config);

	return new Promise((resolve) => {
		const isSettled = (status: Wallet['status']) => status === 'connected' || status === 'disconnected';

		const unsubscribe = config.subscribe(
			(state) => state.status,
			(status) => {
				if (!isSettled(status)) return;
				unsubscribe();
				resolve();
			}
		);

		setTimeout(() => settleStalledReconnect(), RECONNECT_TIMEOUT);
	});
}

/**
 * Whether the current wagmi connection is still the partial connector object rehydrated from
 * `localStorage` (`{ id, name, type, uid }`) rather than a live connector instance.
 */
export function hasStubConnection(): boolean {
	const { connections, current } = config.state;
	const connector = current ? connections.get(current)?.connector : undefined;
	return connector != null && typeof connector.getChainId !== 'function';
}

/**
 * Force a settled status if `reconnect()` has not produced one within `RECONNECT_TIMEOUT`.
 *
 * Three cases, decided by what sits under `state.current` rather than by `status` (see the race
 * note in `startReconnect`):
 *
 * - a storage stub: the wallet never answered. Drop it and go `disconnected`, so the UI offers
 *   "Connect wallet" and a fresh `connect()` replaces the stub. wagmi's own `reconnect()` may still
 *   complete later — `promoteLateReconnect` handles that;
 * - a live connector: the wallet answered but `reconnect()` is still busy probing *other*
 *   connectors (MetaMask SDK and WalletConnect initialise slowly, and can stall). wagmi would set
 *   `connected` when the loop ends; do it now so the page is not stuck on a spinner. wagmi's
 *   final status write is guarded (`reconnecting`/`connecting` only), so it will not undo this;
 * - nothing: no persisted session, `reconnect()` is probing connectors for an authorised one and
 *   has not found any. Go `disconnected` — a wallet that shows up later goes through `connect()`.
 *
 * A user-initiated `connect()` that happens to be in flight at the 10s mark is unaffected: wagmi's
 * `connect` action writes `connected` unconditionally when it completes.
 */
function settleStalledReconnect() {
	const { status, connections, current } = config.state;
	if (status === 'connected' || status === 'disconnected') return;

	if (hasStubConnection()) {
		console.warn(`Wallet did not answer within ${RECONNECT_TIMEOUT}ms; dropping the persisted connection`);
		config.setState((state) => ({ ...state, connections: new Map(), current: null, status: 'disconnected' }));
		promoteLateReconnect();
		return;
	}

	const live = current ? connections.get(current) : undefined;
	config.setState((state) => ({ ...state, status: live ? 'connected' : 'disconnected' }));
}

/**
 * After a stalled reconnect was forced to `disconnected`, the hung `reconnect()` may still finish
 * (the extension's service worker woke up). wagmi then stores the live connection and sets
 * `state.current`, but only promotes `status` when it is still `reconnecting`/`connecting` — so
 * without this the store would hold a live connection while the page keeps saying "Wallet not
 * connected". Promote to `connected` when a live connection appears under `current` while
 * `disconnected`.
 *
 * Only that exact combination is promoted: `connect()` goes through `connecting` and writes
 * `connected` itself, and `disconnect()` clears `current`, so neither is affected.
 */
function promoteLateReconnect() {
	const unsubscribe = config.subscribe(
		(state) => state.current,
		(current) => {
			if (!current || config.state.status !== 'disconnected' || hasStubConnection()) return;
			unsubscribe();
			console.info('Wallet answered after the reconnect timeout; restoring the connection');
			config.setState((state) => ({ ...state, status: 'connected' }));
		}
	);
}

/**
 * Request wallet to switch to a different chain id.
 *
 * Resolves (rather than rejects) when the user dismisses the wallet's switch prompt: every caller
 * is a fire-and-forget click handler and would otherwise leave an uncaught
 * `UserRejectedRequestError`. The UI already shows "Wrong network" for as long as the chain does
 * not match, so there is nothing further to do. Other failures are logged and swallowed for the
 * same reason. `wagmi` also invokes `wallet_switchEthereumChain` when the wallet is already on
 * the requested chain; wallets answer that immediately without a prompt.
 */
export async function switchChain(chainId: number): Promise<void> {
	try {
		await _switchChain(config, { chainId });
	} catch (e) {
		if (errorCausedBy(e, 'UserRejectedRequestError')) return;
		console.error('Failed to switch chain', e);
	}
}

/**
 * Store unsubscribe function for modal state (no-op by default; see `connect` below)
 */
let unsubModalState = () => {};

/**
 * Open AppKit connect dialog
 *
 * @param chainId - if provided, attempt auto-switch to chain after dialog closes
 */
export function connect(chainId?: number) {
	// remove previous modal state subscription if it's still active
	unsubModalState();

	modal.open({ view: 'Connect' });

	if (!chainId) return;

	// switch to requested chain when modal is closed (and remove subscription); the user may have
	// dismissed the modal without connecting, in which case there is no connector to switch
	unsubModalState = modal.subscribeState(({ open }) => {
		if (open) return;
		unsubModalState();
		if (config.state.status === 'connected') switchChain(chainId);
	});
}

/**
 * Disconnect the user's wallet.
 *
 * wagmi's `disconnect` calls `connector.disconnect()`; if the connection is a storage stub (a
 * persisted session that never finished reconnecting) that is not a function and the action
 * throws. The user asked to be disconnected, so on any failure clear the state directly.
 */
export async function disconnect(): Promise<void> {
	try {
		await _disconnect(config);
	} catch (e) {
		console.error('Failed to disconnect wallet cleanly; clearing wallet state', e);
		config.setState((state) => ({ ...state, connections: new Map(), current: null, status: 'disconnected' }));
	}
}
