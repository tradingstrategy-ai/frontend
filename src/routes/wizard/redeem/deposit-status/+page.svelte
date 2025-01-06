<script lang="ts">
	import type { RedeemWizardData } from '../+layout';
	import { wizard } from 'wizard/store';
	import { fade } from 'svelte/transition';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import { getBalance } from '@wagmi/core';
	import { type ConnectedWallet, config, wallet } from '$lib/wallet/client';
	import { Alert, Button, EntitySymbol, Grid, Spinner } from '$lib/components';
	import VaultBalance from '$lib/wallet/VaultBalance.svelte';
	import WalletInfo from '$lib/wallet/WalletInfo.svelte';
	import WalletInfoItem from '$lib/wallet/WalletInfoItem.svelte';
	import { buyNativeCurrencyUrl } from '$lib/wallet/helpers';
	import { getLogoUrl } from '$lib/helpers/assets';

	$: ({ address } = $wallet as ConnectedWallet);
	$: ({ chain, contracts, nativeCurrency, vaultShares } = $wizard.data as RedeemWizardData);
	$: chainCurrency = $wallet.chain?.nativeCurrency.symbol;

	$: depositStatusComplete =
		'vaultNetValue' in $wizard.data && (nativeCurrency?.value ?? 0n) > 0n && (vaultShares?.value ?? 0n) > 0n;

	$: wizard.toggleComplete('deposit-status', depositStatusComplete);

	async function getNativeCurrency(address: Address) {
		const nativeCurrency = await getBalance(config, { address });
		wizard.updateData({ nativeCurrency });
		return nativeCurrency;
	}
</script>

<Grid gap="lg">
	<VaultBalance {contracts} {address} on:dataFetch={({ detail }) => wizard.updateData(detail)} />

	<div class="gas-fees-balance">
		<h3>Balance for gas fees</h3>

		<WalletInfo alignValues="right">
			<WalletInfoItem>
				<EntitySymbol slot="label" size="1.5rem" label={chainCurrency} logoUrl={getLogoUrl('token', chainCurrency)} />
				{#await getNativeCurrency(address)}
					<Spinner />
				{:then balance}
					{formatBalance(balance, 2, 4)}
				{/await}
			</WalletInfoItem>
		</WalletInfo>
	</div>

	{#if vaultShares?.value === 0n}
		<div in:fade>
			<Alert status="error" size="md">
				You do not currently have any shares of <strong>{vaultShares.symbol}</strong> to redeem.
			</Alert>
		</div>
	{:else if nativeCurrency?.value === 0n}
		{@const href = buyNativeCurrencyUrl(chain.id)}
		<div in:fade>
			<Alert status="warning" size="md">
				<strong>{nativeCurrency.symbol}</strong> is required to pay gas fees when redeeming from this strategy.
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
</Grid>

<style>
	h3 {
		color: var(--c-text-light);
		font: var(--f-ui-lg-medium);
	}
</style>
