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
 * How long `reconnect()` gets to restore a persisted session before the wallet is forced into a
 * settled state. Injected wallets answer in milliseconds (a cold Chrome MV3 service worker in a
 * few hundred); WalletConnect session restores can take a few seconds.
 */
export const RECONNECT_TIMEOUT = 10_000;

const { subscribe, set }: Writable<Wallet> = writable(getAccount(config));
watchAccount(config, { onChange: set });

export const wallet = { subscribe };

/**
 * Resolves once the wallet status is settled (`connected` or `disconnected`) after the page-load
 * reconnect, either because wagmi finished or because `RECONNECT_TIMEOUT` forced it.
 *
 * Until then `$wallet.status` is `connecting` or `reconnecting` and wagmi still reports the
 * *persisted* address — enough for public reads, not for signing. Code that must decide "is the
 * user connected" (the wizard step guard) awaits this so that "not yet" is not mistaken for "no".
 * Resolves immediately on the server.
 */
export const walletSettled: Promise<void> = restoreSession();

function isSettled(status: Wallet['status']) {
	return status === 'connected' || status === 'disconnected';
}

/**
 * Whether the connection under `state.current` is still the partial connector wagmi rehydrated
 * from storage (`{ id, name, type, uid }`, no methods) rather than a live connector instance.
 */
function hasStubConnection() {
	const { connections, current } = config.state;
	const connector = current ? connections.get(current)?.connector : undefined;
	return connector != null && typeof connector.getChainId !== 'function';
}

/** Drop any connection and report the wallet as disconnected */
function resetWalletState() {
	config.setState((state) => ({ ...state, connections: new Map(), current: null, status: 'disconnected' }));
}

/**
 * Restore a persisted wallet session, bounded by `RECONNECT_TIMEOUT`.
 *
 * wagmi persists the last connection with a stub connector and `reconnect()` swaps a live one in.
 * If the wallet's provider never answers `eth_accounts` (a hung extension), `reconnect()` awaits it
 * forever: the status never settles, the stub stays under `state.current`, `getAccount()` keeps
 * reporting the persisted address, and any write fails with the opaque
 * `connector.getChainId is not a function`. So after the timeout the state is settled by hand
 * (`settleStalledReconnect`).
 *
 * Whether the status is `connecting` or `reconnecting` meanwhile depends on a race — wagmi
 * hydrates its persisted state asynchronously, so `reconnect()` may start before `state.current`
 * is restored — which is why the code here keys on the connection, never on one of those two.
 * AppKit's wagmi adapter also calls `reconnect()`; wagmi runs whichever call comes first and
 * ignores the other, and nothing here depends on which that is.
 */
function restoreSession(): Promise<void> {
	if (!browser) return Promise.resolve();

	reconnect(config);
	setTimeout(settleStalledReconnect, RECONNECT_TIMEOUT);

	return new Promise((resolve) => {
		const unsubscribe = config.subscribe(
			(state) => state.status,
			(status) => {
				if (!isSettled(status)) return;
				unsubscribe();
				resolve();
			}
		);
	});
}

/**
 * Force a settled status if `reconnect()` has not produced one in time, based on what sits under
 * `state.current`:
 *
 * - a storage stub — the wallet never answered: drop it and go `disconnected`, so the UI offers
 *   "Connect wallet" and a fresh `connect()` replaces the stub. The hung `reconnect()` is also
 *   stopped from landing later (`abandonReconnect`);
 * - a live connector — the wallet answered but `reconnect()` is still probing the other connectors
 *   (MetaMask SDK and WalletConnect initialise slowly): go `connected` now, as wagmi would once its
 *   loop ends;
 * - nothing — no session to restore: go `disconnected`.
 *
 * wagmi's own final status write only applies while still `connecting`/`reconnecting`, so it
 * cannot undo this, and a user-initiated `connect()` in flight at this moment is unaffected because
 * the `connect` action writes `connected` unconditionally when it completes.
 */
function settleStalledReconnect() {
	const { status, connections, current } = config.state;
	if (isSettled(status)) return;

	if (hasStubConnection()) {
		console.warn(`Wallet did not answer within ${RECONNECT_TIMEOUT}ms; dropping the persisted connection`);
		abandonReconnect(connections.get(current!)!.connector.id);
		resetWalletState();
	} else {
		config.setState((state) => ({ ...state, status: current ? 'connected' : 'disconnected' }));
	}
}

/**
 * Make sure a `reconnect()` that `settleStalledReconnect` gave up on never takes effect, even if
 * the extension's service worker wakes up minutes later.
 *
 * wagmi's `reconnect()` cannot be cancelled, and if it completed late it would *replace*
 * `state.connections` with that one connection and make it `current`. AppKit's adapter then treats
 * that as the user switching wallets and disconnects whatever they had connected in the meantime
 * (`handlePreviousConnectorConnection`), and an explicit disconnect would be undone as well. Since
 * AppKit's listeners run before any of ours, that cannot be repaired after the fact — so it is
 * prevented instead: `reconnect()` calls `connector.connect({ isReconnecting: true })` and skips
 * the connector when that rejects, which is what the abandoned connector now does. A user-initiated
 * `connect()` (no `isReconnecting`) still goes through, so the wallet can be reconnected from the
 * modal as soon as it answers again; the next page load starts with a fresh connector.
 */
function abandonReconnect(connectorId: string) {
	const connector = config.connectors.find((c) => c.id === connectorId);
	if (!connector) return;

	const connect = connector.connect.bind(connector);
	connector.connect = (parameters) =>
		parameters?.isReconnecting
			? Promise.reject(new Error(`${connectorId}: reconnect abandoned after ${RECONNECT_TIMEOUT}ms`))
			: connect(parameters);
}

/**
 * Request wallet to switch to a different chain id.
 *
 * Every caller is a fire-and-forget click handler, so a dismissed wallet prompt must not surface
 * as an uncaught `UserRejectedRequestError`; the UI keeps showing "Wrong network" while the chain
 * does not match, which is all the feedback needed. Other failures are logged.
 */
export async function switchChain(chainId: number): Promise<void> {
	try {
		await _switchChain(config, { chainId });
	} catch (e) {
		if (!errorCausedBy(e, 'UserRejectedRequestError')) console.error('Failed to switch chain', e);
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
 * wagmi's `disconnect` calls `connector.disconnect()`, which a storage stub does not have. The
 * user asked to be disconnected, so on any failure clear the state directly.
 */
export async function disconnect(): Promise<void> {
	try {
		await _disconnect(config);
	} catch (e) {
		console.error('Failed to disconnect wallet cleanly; clearing wallet state', e);
		resetWalletState();
	}
}
