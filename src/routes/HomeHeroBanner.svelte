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
	import mbp15Image from '$lib/assets/misc/mbp-15.webp';
	import { Button } from '$lib/components';

	export let impressiveNumbers: any;
</script>

<header class="home-hero-banner" on:dblclick={() => goto('/strategies')}>
	<div class="inner ds-container">
		<img class="media" src={mbp15Image} alt="Trading Data" />

		<div class="content">
			<h1>
				<!-- ensure line breaks at correct place on larger screens -->
				Next generation <br />algorithmic trading protocol <br />for decentralised markets
			</h1>

			<hr />

			{#if impressiveNumbers}
				<p class="impressive-numbers">
					Market data and trading strategy framework for
					<a href="/trading-view/trading-pairs">
						{formatAmount(impressiveNumbers.pairs)} trading pairs
					</a>
					providing
					<a href="/trading-view/trading-pairs" style:white-space="nowrap">
						{formatDollar(impressiveNumbers.liquidity)} liquidity
					</a>
					across
					<a href="/trading-view/blockchains" style:white-space="nowrap">
						{impressiveNumbers.blockchains} blockchains
					</a>
				</p>
			{/if}

			<div class="buttons">
				<Button href="/trading-view">Explore DEX Data</Button>
				<Button secondary href="https://tradingstrategy.ai/docs">Read Documentation</Button>
			</div>
		</div>
	</div>
</header>

<style lang="postcss">
	.home-hero-banner {
		background: hsla(var(--hsla-background-accent-1));
		padding: var(--space-xl) 0;
		@media (--viewport-md-up) {
			padding: var(--space-10xl) var(--space-3xl);
		}
	}

	h1 {
		@media (--viewport-xs) {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}

		@media (--viewport-xl-down) {
			& br {
				display: none;
			}
		}
	}

	p {
		font: var(--f-ui-xl-roman);
		letter-spacing: var(--f-ui-xl-spacing, normal);

		& a {
			font: var(--f-ui-xl-bold);
			letter-spacing: var(--f-ui-xl-spacing, normal);
			text-decoration: underline;
		}
	}

	.inner {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(24rem, calc(100vw - 2 * var(--space-xl))), auto));
		gap: min(var(--space-8xl), 10vw);
		place-items: center;
	}

	.buttons {
		display: grid;
		gap: var(--space-ls);
		grid-template-columns: repeat(auto-fit, minmax(12rem, auto));
		/* place-content: center start; */
		margin-top: var(--space-xl);
	}

	hr {
		border: 0.125rem solid hsla(var(--hsl-text));
	}
</style>
