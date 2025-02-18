<script lang="ts">
	import type { RedeemWizardData, RedeemWizardDataSchema } from '../+layout';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { config } from '$lib/wallet/client';
	import Alert from '$lib/components/Alert.svelte';
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

	const requiresSettlement = vault.requiresSettlement();
	const redemptionResultPromise = vault.getRedemptionResult(config, transactionLogs);
</script>

<div class="redemption-success">
	<p>
		Congratulations! You've
		{requiresSettlement ? 'initiated the redemption of' : 'successfully redeemed'}
		<strong>{formatNumber(shares, 2, 5)} shares</strong> of
		<strong>{strategy.name}</strong>. Click "Done" to return to the strategy overview page.
	</p>

	<h3>
		{requiresSettlement ? 'Estimated share value' : 'The following tokens have been added to your wallet'}
	</h3>

	<WalletInfo alignValues="right">
		{#await redemptionResultPromise}
			<WalletInfoItem>
				<span slot="label" class="skeleton">-</span>
				<span class="skeleton">-</span>
			</WalletInfoItem>
		{:then { estimatedValue, assetsReceived }}
			{@const tokenBalances = requiresSettlement ? [estimatedValue] : assetsReceived}
			{#each tokenBalances as { label, symbol, ...balance }}
				<WalletInfoItem>
					<EntitySymbol slot="label" size="1.5rem" {label} logoUrl={getLogoUrl('token', symbol)} />
					{formatBalance(balance, 2, 4)}
				</WalletInfoItem>
			{/each}
		{/await}
	</WalletInfo>

	{#if requiresSettlement}
		<Alert size="sm" status="info" title="Settlement in progress">
			Your redemption is now <i>pending</i>. Once settlement is complete, you'll be able to claim your redeemed tokens.
			<a href={vault.settlementInfoUrl} target="_blank" rel="noreferrer">Learn more about settlement</a>
		</Alert>
	{/if}
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
