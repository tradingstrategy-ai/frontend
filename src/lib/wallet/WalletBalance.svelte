<script lang="ts">
	import { type Address, type Chain, fetchBalance } from '@wagmi/core';
	import { wallet } from '$lib/wallet/client';
	import { getExplorerUrl, getUsdcAddress } from '$lib/wallet/utils';
	import { CryptoAddressWidget, EntitySymbol } from '$lib/components';

	$: ({ address, chain } = $wallet);
	$: chainCurrency = chain?.nativeCurrency.symbol;
	$: balances = getBalances(chain, address);

	// TODO: refactor to derived store?
	async function getBalances(chain: Chain, address: Address) {
		if (!(chain && address)) return {};
		const token = getUsdcAddress(chain.id);
		const promises = [fetchBalance({ address })];
		token && promises.push(fetchBalance({ address, token }));
		const [native, usdc] = await Promise.all(promises);
		return { native, usdc };
	}
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
				{#await balances}
					---
				{:then { native }}
					{native?.formatted ?? '---'}
				{/await}
			</td>
		</tr>
		<tr>
			<td><EntitySymbol type="token" label="USDC" slug="usdc" /></td>
			<td>
				{#await balances}
					---
				{:then { usdc }}
					{usdc?.formatted ?? '---'}
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
