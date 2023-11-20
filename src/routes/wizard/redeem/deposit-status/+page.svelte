<script lang="ts">
	import { wizard } from 'wizard/store';
	import { fade } from 'svelte/transition';
	import { formatNumber } from '$lib/helpers/formatters';
	import { fetchBalance } from '@wagmi/core';
	import { buyNativeCurrencyUrl, wallet, VaultBalance, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { Alert, Button, Grid, EntitySymbol } from '$lib/components';
	import Spinner from 'svelte-spinner';

	$: ({ address, chain } = $wallet);
	$: ({ chainId, contracts, nativeCurrency, vaultShares } = $wizard.data);
	$: chainCurrency = chain?.nativeCurrency.symbol;

	$: depositStatusComplete =
		'denominationToken' in $wizard.data &&
		'vaultNetValue' in $wizard.data &&
		nativeCurrency?.value > 0n &&
		vaultShares?.value > 0n;

	$: wizard.toggleComplete('deposit-status', depositStatusComplete);

	async function getNativeCurrency(address: Address) {
		const nativeCurrency = await fetchBalance({ address });
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
				<EntitySymbol slot="label" type="token" label={chainCurrency} slug={chainCurrency?.toLowerCase()} />
				{#await getNativeCurrency(address)}
					<Spinner size="30" color="hsl(var(--hsl-text-light))" />
				{:then balance}
					{formatNumber(balance.formatted, 2, 4)}
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
		{@const href = buyNativeCurrencyUrl(chainId)}
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

<style lang="postcss">
	h3 {
		color: hsl(var(--hsl-text-light));
		font: var(--f-ui-lg-medium);
	}
</style>
