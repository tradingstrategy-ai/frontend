<script lang="ts">
	import { Button } from '$lib/components';
	import WalletTile from './WalletTile.svelte';
	import WalletSummary from './WalletSummary.svelte';

	let connectedWallet: 'metamask' | 'walletconnect' | undefined;

	const walletNames = {
		metamask: 'MetaMask',
		walletconnect: 'WalletConnect'
	};

	// TODO: implement real MetaMask connection
	function connectMetaMask() {
		connectedWallet = 'metamask';
	}

	// TODO: implement real WalletConnect connection
	function connectWalletConnect() {
		connectedWallet = 'walletconnect';
	}

	function disconnectWallet() {
		connectedWallet = undefined;
	}
</script>

<div class="connect-wallet">
	{#if connectedWallet}
		<div class="connected-wallet">
			<WalletSummary slug={connectedWallet} name={walletNames[connectedWallet]} />
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
