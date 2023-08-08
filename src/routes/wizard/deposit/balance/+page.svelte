<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getChainSlug } from '$lib/helpers/chain.js';
	import { buyTokenUrl, buyNativeCurrencyUrl, WalletBalance } from '$lib/wallet';
	import { Alert, Button, WizardActions } from '$lib/components';

	export let data;

	$: ({ chains, wizard } = data);
	$: ({ chainId, contracts, nativeCurrency, denominationToken } = $wizard.data);
	$: chainSlug = getChainSlug(chains, chainId);

	$: if (nativeCurrency?.value > 0n && denominationToken?.value > 0n) {
		wizard.toggleComplete('balance');
	}
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

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="payment" disabled={!$wizard.completed.has('balance')} />
</WizardActions>

<style lang="postcss">
	.deposit-balance-page {
		display: grid;
		gap: var(--space-md);
	}
</style>
