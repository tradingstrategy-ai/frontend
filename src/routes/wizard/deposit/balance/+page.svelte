<script lang="ts">
	import { wizard } from 'wizard/store';
	import { buyTokenUrl, buyNativeCurrencyUrl, WalletBalance } from '$lib/wallet';
	import { getChain } from '$lib/helpers/chain';
	import { Alert, Button } from '$lib/components';

	export let data;
	const { chainId, nativeCurrency, denominationToken } = data;

	const chainSlug = getChain(chainId)?.slug;

	wizard.updateData({ nativeCurrency, denominationToken });
	wizard.toggleComplete('balance', nativeCurrency.value > 0n && denominationToken.value > 0n);
</script>

<div class="deposit-balance-page">
	<WalletBalance {nativeCurrency} {denominationToken} />

	{#if nativeCurrency.value === 0n}
		{@const href = buyNativeCurrencyUrl(chainId)}
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
		{@const href = chainSlug && buyTokenUrl(chainSlug, denominationToken.address)}
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
