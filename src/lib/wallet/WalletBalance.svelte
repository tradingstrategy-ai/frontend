<script lang="ts">
	import { fetchBalance } from '@wagmi/core';
	import { wallet } from '$lib/wallet/client';
	import { getUsdcAddress } from '$lib/wallet/utils';
	import { EntitySymbol } from '$lib/components';
	import WalletAddress from './WalletAddress.svelte';
	import Spinner from 'svelte-spinner';
	import Button from '$lib/components/Button.svelte';
	import AlertList from '$lib/components/AlertList.svelte';
	import AlertItem from '$lib/components/AlertItem.svelte';

	$: ({ address, chain } = $wallet);
	$: chainCurrency = chain?.nativeCurrency.symbol;

	export let hasBuyCtas = false;
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
				{#await fetchBalance({ address })}
					<Spinner size="30" color="hsla(var(--hsl-text-light))" />
				{:then balance}
					{#if Number(balance.formatted) > 0}
						{balance.formatted}
					{:else}
						<span class="alerts-container">
							<AlertList size="xs" status="warning">
								<AlertItem>
									<!-- <span>You need MATIC to cover gas fees</span> -->
									<Button slot="action" size="sm">Buy MATIC</Button>
								</AlertItem>
							</AlertList>
						</span>
					{/if}
				{/await}
			</td>
		</tr>
		<tr>
			<td><EntitySymbol type="token" label="USDC" slug="usdc" /></td>
			<td>
				{#await fetchBalance({ address, token: getUsdcAddress(chain.id) })}
					<Spinner size="30" color="hsla(var(--hsl-text-light))" />
				{:then balance}
					{#if Number(balance.formatted) > 0}
						{balance.formatted}
					{:else}
						<span class="alerts-container">
							<AlertList size="sm" status="warning">
								<AlertItem>
									You don't have USDC in your wallet. You need to have USDC to deposit to this strategy.
									<div class="swap-cta" slot="action">
										<Button
											href="https://app.uniswap.org/#/tokens/polygon/0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
											rel="noreferrer"
											target="_blank"
											size="sm">Buy USDC on Uniswap</Button
										>
									</div>
								</AlertItem>
							</AlertList>
						</span>
					{/if}
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

		& :global {
			& .alerts-container {
				width: 100%;
			}

			& .swap-cta {
				align-items: center;
				display: flex;
				flex-wrap: wrap;
				gap: var(--space-ss);
				margin-top: var(--space-xxs);
				justify-content: center;
				@media (--viewport-sm-down) {
					width: 100%;
				}
			}

			& .alert-list {
				margin-block: var(--space-sm);
			}

			& .alert-item {
				text-align: left;
				justify-content: space-between;
				@media (--viewport-sm-down) {
					justify-content: center;
				}
			}
		}
	}
</style>
