<script lang="ts">
	import type { RedeemWizardDataSchema, RedeemWizardData } from '../+layout';
	import { fade } from 'svelte/transition';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import { Alert, Button, EntitySymbol, Grid, Spinner } from '$lib/components';
	import ShareBalances from '$lib/wallet/ShareBalances.svelte';
	import WalletInfo from '$lib/wallet/WalletInfo.svelte';
	import WalletInfoItem from '$lib/wallet/WalletInfoItem.svelte';
	import { buyNativeCurrencyUrl } from '$lib/wallet/helpers';
	import { getLogoUrl } from '$lib/helpers/assets';

	let { data } = $props();
	const { chain, tokenPromises } = data;

	const wizard = getWizardContext<RedeemWizardDataSchema>();

	let tokens = $derived(wizard.data);

	let isComplete = $derived.by(() => {
		const { nativeCurrency, vaultShares, vaultNetValue } = tokens;
		return Boolean(nativeCurrency?.value && vaultShares?.value && vaultNetValue?.value);
	});

	// update wizard data when promises resolve
	(['nativeCurrency', 'vaultShares', 'vaultNetValue'] as const).forEach((key) => {
		tokenPromises[key].then((token) => wizard.updateData({ [key]: token }));
	});

	$effect(() => {
		wizard.toggleComplete('deposit-status', isComplete);
	});
</script>

<Grid gap="lg">
	<ShareBalances shares={tokenPromises.vaultShares} value={tokenPromises.vaultNetValue} />

	<div class="gas-fees-balance">
		<h3>Balance for gas fees</h3>

		<WalletInfo alignValues="right">
			<WalletInfoItem>
				<EntitySymbol slot="label" size="1.5rem" label={chain.gas} logoUrl={getLogoUrl('token', chain.gas)} />
				{#await tokenPromises.nativeCurrency}
					<span class="skeleton" style:width="8ch" style:display="inline-grid">-</span>
				{:then balance}
					{formatBalance(balance, 2, 4)}
				{/await}
			</WalletInfoItem>
		</WalletInfo>
	</div>

	{#if tokens.vaultShares?.value === 0n}
		<div in:fade>
			<Alert status="error" size="md">
				You do not currently have any shares of <strong>{tokens.vaultShares.symbol}</strong> to redeem.
			</Alert>
		</div>
	{:else if tokens.nativeCurrency?.value === 0n}
		{@const href = buyNativeCurrencyUrl(chain.id)}
		<div in:fade>
			<Alert status="warning" size="md">
				<strong>{tokens.nativeCurrency.symbol}</strong> is required to pay gas fees when redeeming from this strategy.
				<Button
					slot="cta"
					size="sm"
					label="Buy {tokens.nativeCurrency.symbol}"
					disabled={!href}
					{href}
					target="_blank"
					rel="noreferrer"
				/>
			</Alert>
		</div>
	{/if}
</Grid>

<style>
	h3 {
		color: var(--c-text-light);
		font: var(--f-ui-lg-medium);
	}
</style>
