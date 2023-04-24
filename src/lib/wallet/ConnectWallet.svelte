<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import { connected, chainData, defaultEvmStores, signerAddress } from 'ethers-svelte';
	import { Button } from '$lib/components';
	import WalletTile from './WalletTile.svelte';
	import WalletSummary from './WalletSummary.svelte';

	export let chains: Chain[];

	const walletNames = {
		metamask: 'MetaMask',
		walletconnect: 'WalletConnect'
	};

	function connectMetaMask() {
		defaultEvmStores.setProvider();
	}

	function connectWalletConnect() {
		// TODO: implement real WalletConnect connection
	}

	function disconnectWallet() {
		defaultEvmStores.disconnect();
	}
</script>

<div class="connect-wallet">
	{#if $connected}
		<!-- hard-coding `metamask` for now; TODO: determine which wallet is connected -->
		{@const wallet = 'metamask'}
		<div class="connected-wallet">
			<WalletSummary
				walletSlug={wallet}
				walletName={walletNames[wallet]}
				address={$signerAddress}
				network={$chainData}
				{chains}
			/>
			<Button size="sm" label="Change wallet" on:click={disconnectWallet} />
		</div>
	{:else}
		<div class="wallet-options">
			<WalletTile name="MetaMask" slug="metamask" on:click={connectMetaMask}>
				Connect to your<br />
				MetaMask Wallet
			</WalletTile>
			<WalletTile name="WalletConnect" slug="walletconnect" on:click={connectWalletConnect}>
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
