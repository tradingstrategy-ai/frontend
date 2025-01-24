<script lang="ts">
	import type { BaseVault } from 'trade-executor/vaults/base';
	import type { SmartContracts } from 'trade-executor/schemas/summary';
	import { createEventDispatcher } from 'svelte';
	import { config } from '$lib/wallet/client';
	import { DataBox } from '$lib/components';
	import TokenBalance from '$lib/wallet/TokenBalance.svelte';

	export let address: Address;
	export let vault: BaseVault<SmartContracts>;

	const dispatch = createEventDispatcher();

	const shares = vault.getShareBalance(config, address).then((vaultShares) => {
		dispatch('dataFetch', { vaultShares });
		return vaultShares;
	});

	const value = vault.getShareValueUSD(config, address).then((vaultNetValue) => {
		dispatch('dataFetch', { vaultNetValue });
		return vaultNetValue;
	});
</script>

<slot {shares} {value}>
	<div class="vault-balance">
		<DataBox label="Number of shares">
			<TokenBalance data={shares} />
		</DataBox>
		<DataBox label="Value of shares">
			<TokenBalance data={value} />
		</DataBox>
	</div>
</slot>

<style>
	.vault-balance {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, auto));
		gap: var(--space-md) var(--space-lg);

		@media (--viewport-sm-down) {
			gap: var(--space-md);
		}
	}
</style>
