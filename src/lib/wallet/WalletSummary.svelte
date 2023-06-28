<script lang="ts">
	import { switchNetwork } from '@wagmi/core';
	import { type Chain, getChainSlug, getChainName } from '$lib/helpers/chain';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { type ConnectedWallet, WalletAddress, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { AlertItem, AlertList, Button, EntitySymbol } from '$lib/components';

	export let wallet: ConnectedWallet;
	export let chainId: MaybeNumber;
	export let chains: Chain[];

	$: ({ name, chain } = wallet);
	$: walletLogoUrl = getLogoUrl(name.toLowerCase());
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
		{#if chainId && chainId !== chain.id}
			<div class="wrong-network-alert">
				<AlertList size="xs" status="error">
					<AlertItem>
						Wrong network! Please connect to {getChainName(chains, chainId)}
						<Button slot="cta" size="xs" label="Switch network" on:click={() => switchNetwork({ chainId: chainId })} />
					</AlertItem>
				</AlertList>
			</div>
		{:else}
			<EntitySymbol type="blockchain" label={chain.name} slug={getChainSlug(chains, chain.id)} />
		{/if}
	</WalletInfoItem>
</WalletInfo>

<style lang="postcss">
	.connected-wallet {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;

		& img {
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
		background: hsla(var(--hsl-success), 0.2);
		font: var(--f-ui-sm-medium);
		color: hsla(var(--hsl-success));

		& .dot {
			animation: pulse-opacity 1.5s ease-out infinite;
			background: hsla(var(--hsl-success));
			border-radius: 100%;
			height: 0.625rem;
			width: 0.625rem;
		}
	}

	.wrong-network-alert :global(.alert-item) {
		container-type: normal;
	}
</style>
