<script lang="ts">
	import WalletTile from '$lib/components/WalletTile.svelte';
	import MetaMaskLogo from '$lib/assets/logos/metamask.svg';
	import WalletConnectLogo from '$lib/assets/logos/walletconnect.svg';
	import { Button } from '$lib/components';

	$: chosenWallet = '';

	function chooseWallet(name: string) {
		chosenWallet = name;
	}

	function resetWallet() {
		chosenWallet = '';
	}
</script>

<div class="wizard-connect-wallet">
	<header>
		<h2>Connect your wallet</h2>
		<p>
			Irure anim esse non reprehenderit eiusmod minim aliqua ea. Mollit et ex ea elit commodo pariatur id culpa aute
			exercitation cillum cupidatat. Dolore officia et commodo cillum ex ut aliquip sunt.
		</p>
	</header>
	{#if chosenWallet}
		<div class="connected-wallet">
			<table class="responsive">
				<tbody>
					<tr>
						<td> Wallet </td>
						<td class="wallet-data">
							<img alt="MetaMask" src={chosenWallet === 'MetaMask' ? MetaMaskLogo : WalletConnectLogo} width="32" />
							{chosenWallet}
							<span class="status">
								<div class="dot" />
								Connected
							</span>
						</td>
					</tr>
					<tr>
						<td> Account </td>
						<td> 0x6C0836c82d629EF21b9192D88b043e65f4fD7237 </td>
					</tr>
					<tr>
						<td> Blockchain </td>
						<td> Polygon Mainnet </td>
					</tr>
				</tbody>
			</table>

			<Button size="sm" on:click={resetWallet}>Change wallet</Button>
		</div>
	{:else}
		<div class="wallet-choices">
			<WalletTile active={chosenWallet === 'MetaMask'} on:click={() => chooseWallet('MetaMask')}>
				<svelte:fragment slot="logo">
					<img alt="MetaMask" src={MetaMaskLogo} width="120" />
				</svelte:fragment>
				<svelte:fragment slot="name">MetaMask</svelte:fragment>
				<svelte:fragment slot="description">
					Connect to your <br />MetaMask Wallet
				</svelte:fragment>
			</WalletTile>
			<WalletTile active={chosenWallet === 'WalletConnect'} on:click={() => chooseWallet('WalletConnect')}>
				<svelte:fragment slot="logo">
					<img alt="WalletConnect" src={WalletConnectLogo} width="120" />
				</svelte:fragment>
				<svelte:fragment slot="name">WalletConnect</svelte:fragment>
				<svelte:fragment slot="description">
					Scan a QR code <br />with your mobile wallet
				</svelte:fragment>
			</WalletTile>
		</div>
	{/if}
</div>

<style lang="postcss">
	.wizard-connect-wallet {
		display: grid;
		gap: var(--space-lg);
	}
	.wallet-choices {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-md);
	}

	.connected-wallet {
		display: grid;
		gap: var(--space-ls);
		place-items: start;
	}

	.wallet-data {
		align-items: center;
		display: flex;
		gap: var(--space-sm);
	}

	.status {
		align-items: center;
		background: hsla(var(--hsl-success), 0.2);
		border-radius: var(--space-md);
		color: hsla(var(--hsl-success));
		display: flex;
		font: var(--f-ui-sm-medium);
		gap: var(--space-ss);
		margin-left: var(--space-sm);
		padding: var(--space-xs) var(--space-sl);

		& .dot {
			animation: pulse-opacity 1.5s ease-out infinite;
			background: hsla(var(--hsl-success));
			border-radius: 100%;
			height: 0.625rem;
			width: 0.625rem;
		}
	}
</style>
