<script lang="ts">
	import wizard from '../store';
	import { fade } from 'svelte/transition';
	import { fetchBalance } from '@wagmi/core';
	import { buyNativeCurrencyUrl, wallet, VaultBalance, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { AlertList, AlertItem, Button, Grid, EntitySymbol, WizardActions } from '$lib/components';
	import Spinner from 'svelte-spinner';

	$: ({ address, chain } = $wallet);
	$: ({ chainId, contracts, nativeCurrency, vaultShares } = $wizard.data);
	$: chainCurrency = chain?.nativeCurrency.symbol;

	$: if (nativeCurrency?.value > 0n && vaultShares?.value > 0n) {
		wizard.complete('deposit-status');
	}

	async function getNativeCurrency(address: Address) {
		const nativeCurrency = await fetchBalance({ address });
		wizard.updateData({ nativeCurrency });
		return nativeCurrency;
	}
</script>

<Grid gap="lg">
	<VaultBalance {contracts} {address} on:balanceFetch={({ detail }) => wizard.updateData(detail)} />

	<div class="gas-fees-balance">
		<h3>Balance for gas fees</h3>

		<WalletInfo alignValues="right">
			<WalletInfoItem>
				<EntitySymbol slot="label" type="token" label={chainCurrency} slug={chainCurrency?.toLowerCase()} />
				{#await getNativeCurrency(address)}
					<Spinner size="30" color="hsla(var(--hsl-text-light))" />
				{:then balance}
					{balance.formatted ?? '---'}
				{/await}
			</WalletInfoItem>
		</WalletInfo>
	</div>

	{#if vaultShares?.value === 0n}
		<div in:fade>
			<AlertList status="error" size="md">
				<AlertItem>
					You do not currently have any shares of <strong>{vaultShares.symbol}</strong> to redeem.
				</AlertItem>
			</AlertList>
		</div>
	{:else if nativeCurrency?.value === 0n}
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
</Grid>

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button secondary label="Back" href="connect" />
	<Button label="Next" href="shares-redemption" disabled={!$wizard.completed.has('deposit-status')} />
</WizardActions>

<style lang="postcss">
	h3 {
		color: hsla(var(--hsl-text-light));
		font: var(--f-ui-lg-medium);
	}
</style>
