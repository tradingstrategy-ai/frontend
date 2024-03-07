<script lang="ts">
	import type { Chain } from '$lib/helpers/chain.js';
	import { getLogoUrl } from '$lib/helpers/assets';
	import type { ConnectedWallet } from '$lib/wallet';
	import { switchChain, WalletAddress, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { Alert, Button, EntitySymbol } from '$lib/components';

	export let wallet: ConnectedWallet;
	export let chain: Chain;

	$: name = wallet.connector.name;
	$: walletLogoUrl = getLogoUrl('wallet', name.toLowerCase());
</script>

<WalletInfo --wallet-info-label-width="6.5rem">
	<WalletInfoItem label="Wallet">
		<div class="connected-wallet">
			{#if walletLogoUrl}
				<img alt={name} src={walletLogoUrl} />
			{/if}
			{name}
			<span class="status">
				<div class="dot" />
				Connected
			</span>
		</div>
	</WalletInfoItem>

	<WalletInfoItem label="Account">
		<WalletAddress size="sm" {wallet} />
	</WalletInfoItem>

	<WalletInfoItem label="Network">
		{#if chain.id !== wallet.chainId}
			<Alert size="xs" status="error" title="Wrong network">
				Please connect to {chain.name}
				<Button slot="cta" size="xs" label="Switch network" on:click={() => switchChain(chain.id)} />
			</Alert>
		{:else}
			<EntitySymbol type="blockchain" label={chain.name} slug={chain.slug} />
		{/if}
	</WalletInfoItem>
</WalletInfo>

<style lang="postcss">
	.connected-wallet {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;

		img {
			width: 1.75rem;
		}
	}

	.status {
		display: flex;
		gap: var(--space-ss);
		align-items: center;
		margin-left: var(--space-sm);
		padding: var(--space-xs) var(--space-sl);
		border-radius: var(--space-md);
		font: var(--f-ui-sm-medium);
		color: var(--c-success);
		background: color-mix(in srgb, transparent, currentColor 20%);

		.dot {
			animation: pulse-opacity 1.5s ease-out infinite;
			background: currentColor;
			border-radius: 100%;
			height: 0.625rem;
			width: 0.625rem;
		}
	}
</style>
