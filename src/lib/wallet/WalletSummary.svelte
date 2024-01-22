<script lang="ts">
	import { switchChain } from '@wagmi/core';
	import type { ApiChain } from '$lib/helpers/chain.js';
	import { getLogoUrl } from '$lib/helpers/assets';
	import type { ConnectedWallet, ConfiguredChainId } from '$lib/wallet';
	import { config, WalletAddress, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { Alert, Button, EntitySymbol } from '$lib/components';

	export let wallet: ConnectedWallet;
	export let chainId: ConfiguredChainId;
	export let chainInfo: Record<string, ApiChain>;

	$: name = wallet.connector.name;
	$: walletLogoUrl = getLogoUrl('wallet', name.toLowerCase());
	$: chain = chainId != null ? chainInfo[chainId] : undefined;
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
		{#if chain && chainId !== wallet.chainId}
			<Alert size="xs" status="error" title="Wrong network">
				Please connect to {chain.chain_name}
				<Button slot="cta" size="xs" label="Switch network" on:click={() => switchChain(config, { chainId })} />
			</Alert>
		{:else}
			<EntitySymbol type="blockchain" label={wallet.chain?.name} slug={chain?.chain_slug} />
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
		background: hsl(var(--hsl-success) / 20%);
		font: var(--f-ui-sm-medium);
		color: hsl(var(--hsl-success));

		.dot {
			animation: pulse-opacity 1.5s ease-out infinite;
			background: hsl(var(--hsl-success));
			border-radius: 100%;
			height: 0.625rem;
			width: 0.625rem;
		}
	}
</style>
