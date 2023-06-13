<script lang="ts">
	import wizard from '../store';
	import { fetchBalance } from '@wagmi/core';
	import { wallet, VaultBalance, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { Button, Grid, EntitySymbol, WizardActions } from '$lib/components';
	import Spinner from 'svelte-spinner';

	// TODO: require > 0 shares
	wizard.complete('deposit-status');

	$: ({ address, chain } = $wallet);
	$: ({ contracts } = $wizard.data);
	$: chainCurrency = chain?.nativeCurrency.symbol;

	async function getNativeCurrency(address: Address) {
		const nativeCurrency = await fetchBalance({ address });
		wizard.updateData({ nativeCurrency });
		return nativeCurrency;
	}
</script>

<Grid gap="lg">
	<VaultBalance {contracts} {address} />

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
