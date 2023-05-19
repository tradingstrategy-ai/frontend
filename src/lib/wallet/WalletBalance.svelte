<script lang="ts">
	import { fetchBalance } from '@wagmi/core';
	import { wallet } from '$lib/wallet/client';
	import { getExplorerUrl, getUsdcAddress } from '$lib/wallet/utils';
	import { CryptoAddressWidget, EntitySymbol } from '$lib/components';
	import Spinner from 'svelte-spinner';

	$: ({ address, chain } = $wallet);
	$: chainCurrency = chain?.nativeCurrency.symbol;
</script>

<table class="wallet-balance responsive">
	<tbody>
		<tr>
			<td>Account</td>
			<td><CryptoAddressWidget size="sm" {address} href={getExplorerUrl(chain, address)} /></td>
		</tr>
		<tr>
			<td><EntitySymbol type="token" label={chainCurrency} slug={chainCurrency?.toLowerCase()} /></td>
			<td>
				{#await fetchBalance({ address })}
					<Spinner size="30" color="hsla(var(--hsl-text-light))" />
				{:then balance}
					{balance.formatted ?? '---'}
				{/await}
			</td>
		</tr>
		<tr>
			<td><EntitySymbol type="token" label="USDC" slug="usdc" /></td>
			<td>
				{#await fetchBalance({ address, token: getUsdcAddress(chain.id) })}
					<Spinner size="30" color="hsla(var(--hsl-text-light))" />
				{:then balance}
					{balance.formatted ?? '---'}
				{:catch}
					---
				{/await}
			</td>
		</tr>
	</tbody>
</table>

<style lang="postcss">
	.wallet-balance {
		margin: 0;

		/* FIXME: remove `!important` */
		@media (--viewport-sm-up) {
			--table-font: var(--f-ui-lg-medium) !important;
		}

		& td {
			padding: var(--space-xs) var(--space-ml);
			align-content: center;

			&:first-child {
				font: var(--f-ui-md-medium);
			}

			&:last-child {
				--cell-padding: 0 var(--space-md) 0 var(--space-xs);

				@media (--viewport-md-up) {
					text-align: right;
				}
			}
		}
	}
</style>
