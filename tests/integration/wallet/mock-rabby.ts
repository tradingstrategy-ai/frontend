import type { Page } from '@playwright/test';

/**
 * Options for the in-page Rabby wallet emulation.
 */
export type MockRabbyOptions = {
	/** Account the wallet reports as connected */
	address: `0x${string}`;
	/** Chain the wallet reports it is on */
	chainId: number;
	/**
	 * Hold every JSON-RPC request unanswered. Emulates a hung browser extension (e.g. Rabby's
	 * service worker asleep), which leaves wagmi's `reconnect()` awaiting `eth_accounts` forever.
	 * Held requests are answered later if the test calls `releaseMockRabby()`, which emulates the
	 * extension waking up.
	 */
	hang?: boolean;
	/**
	 * Reject `wallet_switchEthereumChain` with EIP-1193 code 4001 ("User rejected the request"),
	 * as a wallet does when the user dismisses the network-switch prompt.
	 */
	rejectChainSwitch?: boolean;
	/**
	 * Time in ms the wallet takes to answer a request (default 50). A cold Chrome MV3 service worker
	 * can take several hundred ms to spin up, so a slow wallet is a realistic reload scenario.
	 */
	responseDelay?: number;
	/**
	 * Seed wagmi's persisted store as if this wallet had been connected on a previous visit. wagmi
	 * only persists a partial connector (`{ id, name, type, uid }`) and relies on `reconnect()` to
	 * swap in a live one.
	 */
	persistedConnection?: boolean;
};

/** Test-side handle the init script leaves on `window` */
type MockRabbyControl = {
	/** JSON-RPC methods the page has sent, in order */
	requests: string[];
	/** While true, requests are queued instead of answered */
	hang: boolean;
	/** Answer every queued request and stop hanging */
	release: () => void;
};

type MockRabbyWindow = Window & { __mockRabby?: MockRabbyControl };

const RABBY_RDNS = 'io.rabby';
const RABBY_NAME = 'Rabby Wallet';
const CONNECTOR_UID = 'mock-rabby-uid';
/** Default emulated extension round-trip time in ms */
const DEFAULT_RESPONSE_DELAY = 50;
/** sessionStorage key that keeps a runtime `hangMockRabby()` in force across reloads */
const HANG_KEY = 'mockRabby.hang';

/**
 * Install a minimal EIP-1193 provider that presents itself as the Rabby browser extension.
 *
 * Why an emulation rather than the real extension: loading Rabby in Playwright needs a persistent
 * browser context, an unlock flow and network access, none of which is deterministic in CI. The
 * behaviour under test is transport-level (does the provider answer at all, and what wagmi does
 * either way), so a fake provider that speaks the same protocol is enough:
 *
 * - `window.ethereum` with `isRabby` / `isMetaMask` flags (Rabby sets both)
 * - EIP-6963 announcement with rdns `io.rabby`, which is how wagmi/AppKit discover it and how the
 *   persisted `io.rabby` connector id is matched on reconnect
 * - `request`, `on` and `removeListener`, the surface wagmi's `injected` connector uses
 *
 * Every JSON-RPC call is recorded on `window.__mockRabby.requests` so tests can assert that wagmi
 * actually went through the wallet, and `window.__mockRabby.hang` / `release()` let a test change
 * the extension's responsiveness mid-flight (see `hangMockRabby()` / `releaseMockRabby()`).
 *
 * Must be called before `page.goto()`.
 */
export async function installMockRabby(page: Page, options: MockRabbyOptions): Promise<void> {
	await page.addInitScript(
		({ options, rdns, name, uid, responseDelay, hangKey }) => {
			if (options.persistedConnection) {
				const connection = {
					accounts: [options.address],
					chainId: options.chainId,
					connector: { id: rdns, name, type: 'injected', uid }
				};
				localStorage.setItem(
					'wagmi.store',
					JSON.stringify({
						state: {
							chainId: options.chainId,
							connections: { __type: 'Map', value: [[uid, connection]] },
							current: uid
						},
						version: 2
					})
				);
				localStorage.setItem('wagmi.recentConnectorId', JSON.stringify(rdns));
			}

			type Listener = (...args: unknown[]) => void;
			const listeners = new Map<string, Set<Listener>>();

			// requests received while hanging; answered on `release()`
			const queued: (() => void)[] = [];

			const control: MockRabbyControl = {
				requests: [],
				// `hangMockRabby()` persists the flag in sessionStorage so a "dead" extension stays dead
				// across `page.reload()`, where this init script runs again with the original options
				hang: Boolean(options.hang) || sessionStorage.getItem(hangKey) === '1',
				release() {
					control.hang = false;
					sessionStorage.removeItem(hangKey);
					for (const answer of queued.splice(0)) answer();
				}
			};
			(window as unknown as MockRabbyWindow).__mockRabby = control;

			function answer(method: string, resolve: (value: unknown) => void, reject: (reason: unknown) => void) {
				switch (method) {
					case 'eth_chainId':
						return resolve(`0x${options.chainId.toString(16)}`);
					case 'eth_accounts':
					case 'eth_requestAccounts':
						return resolve([options.address]);
					case 'wallet_requestPermissions':
						return resolve([{ parentCapability: 'eth_accounts' }]);
					case 'wallet_switchEthereumChain':
						if (options.rejectChainSwitch) return reject({ code: 4001, message: 'User rejected the request.' });
						return resolve(null);
					default:
						return reject({ code: 4200, message: `mock Rabby: unsupported method ${method}` });
				}
			}

			const provider = {
				isRabby: true,
				isMetaMask: true,
				isConnected: () => true,

				request({ method }: { method: string; params?: unknown[] }): Promise<unknown> {
					control.requests.push(method);

					return new Promise((resolve, reject) => {
						// a real extension answers over message passing, i.e. on a later macrotask, never in
						// the same microtask as the request; resolving synchronously would let wagmi finish
						// reconnecting while the app's module graph is still evaluating
						const respond = () => setTimeout(() => answer(method, resolve, reject), responseDelay);
						if (control.hang) queued.push(respond);
						else respond();
					});
				},

				on(event: string, listener: Listener) {
					if (!listeners.has(event)) listeners.set(event, new Set());
					listeners.get(event)!.add(listener);
				},

				removeListener(event: string, listener: Listener) {
					listeners.get(event)?.delete(listener);
				}
			};

			Object.defineProperty(window, 'ethereum', { value: provider, configurable: true });

			const detail = Object.freeze({
				info: {
					uuid: '6d2b0a7c-0e1a-4c6e-9d2f-mockrabby000',
					name,
					rdns,
					icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
				},
				provider
			});
			const announce = () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }));
			window.addEventListener('eip6963:requestProvider', announce);
			announce();
		},
		{
			options,
			rdns: RABBY_RDNS,
			name: RABBY_NAME,
			uid: CONNECTOR_UID,
			responseDelay: options.responseDelay ?? DEFAULT_RESPONSE_DELAY,
			hangKey: HANG_KEY
		}
	);
}

/**
 * JSON-RPC methods the page has sent to the emulated wallet so far.
 */
export function getMockRabbyRequests(page: Page): Promise<string[]> {
	return page.evaluate(() => (window as unknown as MockRabbyWindow).__mockRabby?.requests ?? []);
}

/**
 * Stop answering wallet requests from now on (the extension "dies"). Persists across
 * `page.reload()` until `releaseMockRabby()` is called.
 */
export function hangMockRabby(page: Page): Promise<void> {
	return page.evaluate((hangKey) => {
		sessionStorage.setItem(hangKey, '1');
		(window as unknown as MockRabbyWindow).__mockRabby!.hang = true;
	}, HANG_KEY);
}

/**
 * Answer every wallet request queued while hanging, and answer new ones normally (the extension
 * "wakes up"). Lets a test start with `hang: true` and un-hang at a chosen moment.
 */
export function releaseMockRabby(page: Page): Promise<void> {
	return page.evaluate(() => {
		(window as unknown as MockRabbyWindow).__mockRabby!.release();
	});
}
