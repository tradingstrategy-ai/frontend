<script lang="ts">
	import type { TokenBalance as TokenBalanceType } from '$lib/eth-defi/schemas/token';
	import TokenBalance from '$lib/wallet/TokenBalance.svelte';

	export let label: string;
	export let data: MaybePromise<TokenBalanceType>;
	export let dollar = false;
</script>

<div class="deposit-balance">
	<dt>{label}</dt>
	<dd>
		<TokenBalance {data} let:skeleton let:value let:label>
			<span class="value" class:skeleton>{dollar ? '$' : ''}{value}</span>
			<span class="symbol" class:skeleton>{label}</span>
		</TokenBalance>
	</dd>
</div>

<style>
	.deposit-balance {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 0.375rem;

		dt {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--ls-ui-sm);
		}

		dd {
			display: grid;
			grid-template-rows: auto 1fr;
			--skeleton-height: 90%;
			--skeleton-width: 5ch;
		}

		.value {
			font: var(--f-ui-xxl-medium);
			letter-spacing: var(--ls-ui-xxl);
		}

		.symbol {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--ls-ui-md);
			color: var(--c-text-extra-light);
		}
	}
</style>
