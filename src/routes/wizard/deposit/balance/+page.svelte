<script lang="ts">
	import { fade } from 'svelte/transition';
	import { buyTokenUrl, buyNativeCurrencyUrl } from '$lib/wallet/utils';
	import { getChainSlug } from '$lib/helpers/chain.js';
	import { AlertItem, AlertList, Button, WizardActions } from '$lib/components';
	import WalletBalance from '$lib/wallet/WalletBalance.svelte';

	export let data;

	$: ({ chains, wizard } = data);
	$: ({ chainId, nativeCurrency, denominationToken } = $wizard.data);
	$: chainSlug = getChainSlug(chains, chainId);
	$: if (nativeCurrency?.value > 0n && denominationToken?.value > 0n) {
		wizard.complete('balance');
	}
</script>

<div class="deposit-balance-page">
	<WalletBalance {wizard} />

	{#if nativeCurrency?.value === 0n}
		{@const href = buyNativeCurrencyUrl(chainId)}
		<div in:fade>
			<AlertList status="warning" size="md">
				<AlertItem>
					<strong>{nativeCurrency.symbol}</strong> is required to pay gas fees when investing in this strategy.
					<Button slot="cta" size="sm" label="Buy {nativeCurrency.symbol}" disabled={!href} {href} />
				</AlertItem>
			</AlertList>
		</div>
	{/if}

	{#if denominationToken?.value === 0n}
		<div in:fade>
			<AlertList status="warning" size="md">
				<AlertItem>
					<strong>{denominationToken.symbol}</strong> is required in order to make a deposit into this strategy.
					<Button
						slot="cta"
						size="sm"
						label="Buy {denominationToken.symbol}"
						disabled={!chainSlug}
						href={chainSlug && buyTokenUrl(chainSlug, denominationToken.address)}
					/>
				</AlertItem>
			</AlertList>
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
