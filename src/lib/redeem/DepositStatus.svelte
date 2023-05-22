<script lang="ts">
	import { type Address, type Chain, fetchBalance } from '@wagmi/core';
	import { wallet } from '$lib/wallet/client';
	import { getUsdcAddress } from '$lib/wallet/utils';
	import { DataBox, EntitySymbol, Grid } from '$lib/components';

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
						{#await balances}
							---
						{:then { native }}
							{native?.formatted ?? '---'}
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
