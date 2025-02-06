<script lang="ts">
	import type { RedeemWizardData, RedeemWizardDataSchema } from '../+layout';
	import { beforeNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import { getBalance } from '@wagmi/core';
	import { config, wallet } from '$lib/wallet/client';
	import { Alert, Button, EntitySymbol, Grid, Spinner } from '$lib/components';
	import VaultBalance from '$lib/wallet/VaultBalance.svelte';
	import WalletInfo from '$lib/wallet/WalletInfo.svelte';
	import WalletInfoItem from '$lib/wallet/WalletInfoItem.svelte';
	import { buyNativeCurrencyUrl } from '$lib/wallet/helpers';
	import { getLogoUrl } from '$lib/helpers/assets';

	let { data } = $props();
	const { chain, vault } = data;

	const wizard = getWizardContext<RedeemWizardDataSchema>();

	let address = $derived($wallet.address!);
	let tokens: RedeemWizardData = $state({});

	let isComplete = $derived(
		Boolean(tokens.nativeCurrency?.value && tokens.vaultShares?.value && tokens.vaultNetValue?.value)
	);

	$effect(() => {
		wizard.toggleComplete('deposit-status', isComplete);
	});

	beforeNavigate(() => {
		wizard.data = { ...wizard.data, ...tokens };
	});

	async function getNativeCurrency(address: Address) {
		tokens.nativeCurrency = await getBalance(config, { address });
		return tokens.nativeCurrency;
	}
</script>

<Grid gap="lg">
	<VaultBalance
		{vault}
		{address}
		onDataFetch={(type, val) => {
			tokens[type] = val;
		}}
	/>

	<div class="gas-fees-balance">
		<h3>Balance for gas fees</h3>

		<WalletInfo alignValues="right">
			<WalletInfoItem>
				<EntitySymbol slot="label" size="1.5rem" label={chain.gas} logoUrl={getLogoUrl('token', chain.gas)} />
				{#await getNativeCurrency(address)}
					<Spinner />
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
