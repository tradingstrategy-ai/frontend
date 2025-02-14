<script lang="ts">
	import type { RedeemWizardData, RedeemWizardDataSchema } from '../+layout';
	import type { RedemptionResult } from 'trade-executor/vaults/types';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { config } from '$lib/wallet/client';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import WalletInfo from '$lib/wallet/WalletInfo.svelte';
	import WalletInfoItem from '$lib/wallet/WalletInfoItem.svelte';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import { formatNumber } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	const { data } = $props();
	const { strategy, vault } = data;

	const wizard = getWizardContext<RedeemWizardDataSchema>();
	const { shares, transactionLogs } = wizard.data as Required<RedeemWizardData>;

	// svelte-ignore non_reactive_update
	let redemptionResultPromise: Promise<RedemptionResult>;

	$effect.pre(() => {
		redemptionResultPromise = vault.getRedemptionResult(config, transactionLogs);
	});
</script>

<div class="redemption-success">
	<h3>The following tokens have been added to your wallet</h3>

	<WalletInfo alignValues="right">
		{#await redemptionResultPromise}
			<WalletInfoItem>
				<span slot="label" class="skeleton">-</span>
				<span class="skeleton">-</span>
			</WalletInfoItem>
		{:then { assetsReceived }}
			{#each assetsReceived as asset}
				{@const logoUrl = getLogoUrl('token', asset.symbol)}
				<WalletInfoItem>
					<EntitySymbol slot="label" size="1.5rem" label={asset.label} {logoUrl} />
					{formatBalance(asset, 2, 4)}
				</WalletInfoItem>
			{/each}
		{/await}
	</WalletInfo>

	<p>
		Congratulations! You've successfully redeemed <strong>{formatNumber(shares, 2, 5)} shares</strong> of
		<strong>{strategy.name}</strong>. Click "Done" to return to the strategy.
	</p>
</div>

<style>
	.redemption-success {
		display: grid;
		gap: var(--space-md);
	}

	h3 {
		color: var(--c-text-light);
		font: var(--f-ui-lg-medium);
	}

	.skeleton {
		display: inline-grid;
		width: 8ch;
	}
</style>
