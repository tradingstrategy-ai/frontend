<script lang="ts">
	import type { Wizard } from 'wizard/store';
	import { fetchBalance, readContract } from '@wagmi/core';
	import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
	import { wallet } from '$lib/wallet/client';
	import { EntitySymbol } from '$lib/components';
	import WalletAddress from './WalletAddress.svelte';
	import Spinner from 'svelte-spinner';

	export let wizard: Wizard;

	$: ({ contracts } = $wizard.data);
	$: ({ address, chain } = $wallet);
	$: chainCurrency = chain?.nativeCurrency.symbol;

	async function getNativeCurrency(address: Address) {
		const nativeBalance = await fetchBalance({ address });
		wizard.updateData({ nativeBalance });
		return nativeBalance;
	}

	async function getDenominationToken(address: Address) {
		const token = (await readContract({
			address: contracts.comptroller,
			abi: comptrollerABI,
			functionName: 'getDenominationAsset'
		})) as Address;
		const balance = await fetchBalance({ address, token });
		wizard.updateData({
			denominationToken: { address: token, ...balance }
		});
		return balance;
	}
</script>

<table class="wallet-balance responsive">
	<tbody>
		<tr>
			<td>Account</td>
			<td><WalletAddress size="sm" wallet={$wallet} /></td>
		</tr>
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
		<tr>
			<td><EntitySymbol type="token" label="USDC" slug="usdc" /></td>
			<td>
				{#await getDenominationToken(address)}
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
