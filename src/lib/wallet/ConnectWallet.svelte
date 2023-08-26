<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Chain } from '$lib/helpers/chain';
	import { AlertList, Button } from '$lib/components';
	import { wallet, WalletSummary, WalletTile } from '$lib/wallet';

	export let chainId: MaybeNumber;
	export let chains: Chain[];

	let error: any;

	$: if ($wallet.status === 'connected') {
		error = undefined;
	}

	function handleConnectMetaMask() {
		error = undefined;
		wallet.connectMetaMask(chainId).catch((e) => (error = e));
	}
</script>

<div class="connect-wallet">
	{#if $wallet.status === 'connected'}
		<div class="connected-wallet">
			<WalletSummary wallet={$wallet} {chainId} {chains} />
			<Button size="sm" label="Change wallet" on:click={wallet.disconnect} />
		</div>
	{:else}
		<div class="wallet-options">
			<WalletTile name="Browser Wallet" slug="browser-wallet" on:click={handleConnectMetaMask}>
				Connect to your<br />
				browser-based wallet
			</WalletTile>
			<WalletTile name="WalletConnect" slug="walletconnect" on:click={() => wallet.connectWalletConnect(chainId)}>
				Scan a QR code<br />
				with your mobile wallet
			</WalletTile>
		</div>
	{/if}

	{#if error}
		<div transition:fade>
			<AlertList status="error" size="sm" let:AlertItem>
				{#if error.name === 'ConnectorNotFoundError'}
					<AlertItem title="Not found">
						Wallet browser extension not found. Please confirm you have MetaMask or another browser wallet extension
						installed and enabled, or use WalletConnect to connect a desktop or mobile app-based wallet.
					</AlertItem>
				{:else if error.name === 'UserRejectedRequestError'}
					<AlertItem title="Connection refused">
						The request to connect to your wallet browser extension was refused. Please try again and authorize the
						connection for one or more accounts to continue.
					</AlertItem>
				{:else if error.name === 'ResourceUnavailableRpcError'}
					<AlertItem title="Wallet busy">
						Your wallet browser extension prevented connection because it is busy with another operation (such as
						signing in or importing an account). Open your wallet extension to complete or cancel this operation and try
						again.
					</AlertItem>
				{:else}
					<AlertItem title={error.name}>
						{error.message}
					</AlertItem>
				{/if}
			</AlertList>
		</div>
	{/if}
</div>

<style lang="postcss">
	.connect-wallet {
		display: grid;
		gap: var(--space-xl);
	}

	.connected-wallet {
		display: grid;
		place-items: start;
		gap: var(--space-ls);

		@media (--viewport-sm-down) {
			gap: var(--space-xl);
		}
	}

	.wallet-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-md);
	}
</style>
