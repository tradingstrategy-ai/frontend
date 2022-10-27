<!--
@component
Home page hero banner.

#### Usage:
```tsx
<HeroBanner {impressiveNumbers} />
```
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';

	export let impressiveNumbers: any;
</script>

<header class="ds-container" on:dblclick={() => goto('/strategy')}>
	<h1>
		<div>Next generation</div>
		<div>algorithmic trading protocol</div>
		<div class="secondary">for decentralised markets</div>
	</h1>

	{#if impressiveNumbers}
		<!-- preserving text-wrapping on larger displays - end lines below at preferred line-breaks -->
		<!-- prettier-ignore -->
		<div class="impressive-numbers">
			Market data and trading strategy framework
			for <a href="/trading-view/trading-pairs">{formatAmount(impressiveNumbers.pairs)} trading pairs</a
			> providing <a class="nowrap" href="/trading-view/trading-pairs">{formatDollar(impressiveNumbers.liquidity)} liquidity</a>
			across <a class="nowrap" href="/trading-view/blockchains">{impressiveNumbers.blockchains} blockchains</a>
		</div>
	{/if}
</header>

<style lang="postcss">
	header {
		--container-margin: 2rem;
		background: var(--c-background-1);
		padding-block: 3.5rem;

		@media (--viewport-md-up) {
			padding-block: 12rem;
			text-align: center;
		}

		& h1 {
			font: var(--f-h1-bold);
			margin-bottom: 2rem;

			@media (--viewport-md-up) {
				font: 600 56px/68px var(--ff-display);
				margin-bottom: 3.5rem;
			}

			& .secondary {
				color: var(--c-text-2);
			}
		}
	}

	.impressive-numbers {
		font: var(--f-h3-roman);

		/* toggle white-space setting when longest line no longer fits (adjust width if needed) */
		@media (width >= 768px) {
			white-space: pre-line;
			text-align: center;
		}

		& a {
			border-bottom: 2px solid currentColor;
			font-weight: 600;

			&.nowrap {
				white-space: nowrap;
			}
		}
	}
</style>
