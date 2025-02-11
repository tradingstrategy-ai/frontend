<script lang="ts">
	import type { TokenBalance as TokenBalanceType } from '$lib/eth-defi/schemas/token';
	import { DataBox } from '$lib/components';
	import TokenBalance from '$lib/wallet/TokenBalance.svelte';

	type Props = {
		shares: MaybePromise<TokenBalanceType>;
		value: MaybePromise<TokenBalanceType>;
	};

	let { shares, value }: Props = $props();
</script>

<div class="vault-balance">
	<DataBox label="Number of shares">
		<TokenBalance data={shares} />
	</DataBox>
	<DataBox label="Value of shares">
		<TokenBalance data={value} />
	</DataBox>
</div>

<style>
	.vault-balance {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-md) var(--space-lg);

		@media (--viewport-sm-down) {
			gap: var(--space-md);
		}
	}
</style>
