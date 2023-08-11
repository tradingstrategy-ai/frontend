<script lang="ts">
	import { wizard } from 'wizard/store';
	import { fade } from 'svelte/transition';
	import { getChainSlug } from '$lib/helpers/chain.js';
	import { buyTokenUrl, buyNativeCurrencyUrl, WalletBalance } from '$lib/wallet';
	import { Alert, Button } from '$lib/components';

	export let data;

	$: ({ chainId, contracts, nativeCurrency, denominationToken } = $wizard.data);
	$: chainSlug = getChainSlug(data.chains, chainId);

	$: wizard.toggleComplete('balance', nativeCurrency?.value > 0n && denominationToken?.value > 0n);
</script>

<div class="deposit-balance-page">
	<WalletBalance {contracts} on:dataFetch={({ detail }) => wizard.updateData(detail)} />

	{#if nativeCurrency?.value === 0n}
		{@const href = buyNativeCurrencyUrl(chainId)}
		<div in:fade>
			<Alert status="warning" size="md">
				<strong>{nativeCurrency.symbol}</strong> is required to pay gas fees when investing in this strategy.
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
		</div>
	{/if}

	{#if denominationToken?.value === 0n}
		{@const href = chainSlug && buyTokenUrl(chainSlug, denominationToken.address)}
		<div in:fade>
			<Alert status="warning" size="md">
				<strong>{denominationToken.symbol}</strong> is required in order to make a deposit into this strategy.
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
		</div>
	{/if}
</div>

<style lang="postcss">
	.deposit-balance-page {
		display: grid;
		gap: var(--space-md);
	}
</style>
