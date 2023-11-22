<script lang="ts">
	import type { FetchBalanceResult } from '@wagmi/core';
	import { TokenBalance } from '$lib/wallet';

	export let label: string;
	export let data: MaybePromise<FetchBalanceResult>;
	export let dollar = false;
</script>

<div class="deposit-balance">
	<dt>{label}</dt>
	<TokenBalance {data} let:skeleton let:value let:symbol>
		<dd>
			<span class="value" class:skeleton>{dollar ? '$' : ''}{value}</span>
			<span class="symbol" class:skeleton>{symbol}</span>
		</dd>
	</TokenBalance>
</div>

<style lang="postcss">
	.deposit-balance {
		display: grid;
		gap: 0.375rem;

		dt {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--ls-ui-sm);
		}

		dd {
			display: grid;
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
			color: hsl(var(--hsl-text-extra-light));
		}
	}
</style>
