<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import { wallet } from '$lib/wallet/client';
	import { Button } from '$lib/components';
	import WalletTile from './WalletTile.svelte';
	import WalletSummary from './WalletSummary.svelte';

	export let chainId: MaybeNumber;
	export let chains: Chain[];
</script>

<div class="connect-wallet">
	{#if $wallet.status === 'connected'}
		<div class="connected-wallet">
			<WalletSummary wallet={$wallet} {chainId} {chains} />
			<Button size="sm" label="Change wallet" on:click={wallet.disconnect} />
		</div>
	{:else}
		<div class="wallet-options">
			<WalletTile name="MetaMask" slug="metamask" on:click={() => wallet.connectMetaMask(chainId)}>
				Connect to your<br />
				MetaMask Wallet
			</WalletTile>
			<WalletTile name="WalletConnect" slug="walletconnect" on:click={() => wallet.connectWalletConnect(chainId)}>
				Scan a QR code<br />
				with your mobile wallet
			</WalletTile>
		</div>
	{/if}
</div>

<style lang="postcss">
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
