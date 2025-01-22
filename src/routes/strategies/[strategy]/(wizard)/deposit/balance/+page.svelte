<script lang="ts">
	import type { DepositWizardData } from '../+layout.js';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { Alert, Button } from '$lib/components';
	import WalletBalance from '$lib/wallet/WalletBalance.svelte';
	import { buyTokenUrl, buyNativeCurrencyUrl } from '$lib/wallet/helpers';

	let { data } = $props();
	const { chain, nativeCurrency, denominationToken } = data;
	const wizard = getWizardContext<DepositWizardData>();

	wizard.updateData({ nativeCurrency, denominationToken });
	wizard.toggleComplete('balance', nativeCurrency.value > 0n && denominationToken.value > 0n);
</script>

<div class="deposit-balance-page">
	<WalletBalance {nativeCurrency} {denominationToken} />

	{#if nativeCurrency.value === 0n}
		{@const href = buyNativeCurrencyUrl(chain.id)}
		<Alert status="warning" size="md">
			<strong>{nativeCurrency.symbol}</strong> is required to pay gas fees when participating in this strategy.
			<Button
				slot="cta"
				size="sm"
				label="Buy {nativeCurrency.symbol}"
				disabled={!href}
				{href}
				target="_blank"
				rel="noreferrer"
			/>
		</Alert>
	{/if}

	{#if denominationToken.value === 0n}
		{@const href = buyTokenUrl(chain.slug, denominationToken.address)}
		<Alert status="warning" size="md">
			<strong>{denominationToken.label}</strong> is required in order to make a deposit into this strategy.
			<Button
				slot="cta"
				size="sm"
				label="Buy {denominationToken.symbol}"
				disabled={!href}
				{href}
				target="_blank"
				rel="noreferrer"
			/>
		</Alert>
	{/if}
</div>

<style>
	.deposit-balance-page {
		display: grid;
		gap: var(--space-md);
	}
</style>
