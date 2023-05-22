<script lang="ts">
	import type { Wizard } from 'wizard/store';
	import { fetchBalance } from '@wagmi/core';
	import { wallet } from '$lib/wallet/client';
	import { DataBox, EntitySymbol, Grid } from '$lib/components';
	import Spinner from 'svelte-spinner';

	export let wizard: Wizard;

	$: ({ address, chain } = $wallet);
	$: chainCurrency = chain?.nativeCurrency.symbol;

	async function getNativeCurrency(address: Address) {
		const nativeCurrency = await fetchBalance({ address });
		wizard.updateData({ nativeCurrency });
		return nativeCurrency;
	}
</script>

<div class="deposit-status responsive">
	<Grid cols={2} gap="lg">
		<DataBox label="Number of shares">
			<EntitySymbol label="SHR" slug="uni" type="token">123.45 SHR</EntitySymbol>
		</DataBox>
		<DataBox label="Value of shares">
			<EntitySymbol label="USDC" slug="usdc" type="token">1234.5 USDC</EntitySymbol>
		</DataBox>
	</Grid>

	<div class="gas-fees-balance">
		<h3>Balance for gas fees</h3>
		<table>
			<tbody>
				<tr>
					<td><EntitySymbol type="token" label={chainCurrency} slug={chainCurrency?.toLowerCase()} /></td>
					<td>
						{#await getNativeCurrency(address)}
							<Spinner size="30" color="hsla(var(--hsl-text-light))" />
						{:then balance}
							{balance.formatted ?? '---'}
						{/await}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>

<style lang="postcss">
	.deposit-status {
		display: grid;
		gap: var(--space-lg);
	}
</style>
