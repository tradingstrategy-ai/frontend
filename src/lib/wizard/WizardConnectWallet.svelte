<script lang="ts">
	import WalletTile from '$lib/components/WalletTile.svelte';
	import MetaMaskLogo from '$lib/assets/logos/metamask.svg';
	import WalletConnectLogo from '$lib/assets/logos/walletconnect.svg';
	import { AlertItem, AlertList, Button, EntitySymbol, WalletAddressWidget } from '$lib/components';

	$: chosenWallet = '';
	$: wrongNetwork = true;

	function chooseWallet(name: string) {
		chosenWallet = name;
		window.scroll(0, 0);
	}

	function resetWallet() {
		chosenWallet = '';
	}
</script>

<div class="wizard-connect-wallet">
	<header>
		<h2>Connect your wallet</h2>
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
						<td> <WalletAddressWidget address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" href="#" /> </td>
					</tr>
					<tr>
						<td> Blockchain </td>
						<td>
							{#if wrongNetwork}
								<div
									class="wrong-network-alert"
									on:click={() => (wrongNetwork = false)}
									on:keydown={() => (wrongNetwork = false)}
								>
									<AlertList size="xs" status="error">
										<AlertItem>Wrong network! Please connect to Polygon</AlertItem>
									</AlertList>
								</div>
							{:else}
								<EntitySymbol name="Polygon" type="blockchain" />
							{/if}
						</td>
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
	}

	.wallet-choices {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-md);
	}

	.connected-wallet {
		display: grid;
		place-items: start;
		gap: var(--space-ls);

		@media (--viewport-sm-down) {
			gap: var(--space-xl);
		}

		& :global .alert-list {
			width: auto;
			margin: 0;
		}
	}

	.wallet-data {
		align-items: center;
		display: flex;
		gap: var(--space-sm);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-medium);

			& img {
				width: 1.75rem;
			}
		}
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

	.wrong-network-alert {
		display: flex;
		justify-content: flex-start;
	}

	.wizard-connect-wallet :global table.responsive tbody tr {
		grid-template-columns: repeat(auto-fit, minmax(max(25%, 14rem), 1fr)) !important;
	}
</style>
