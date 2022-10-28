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
	import mbp15Image from '$lib/assets/misc/mbp-15.png';

	export let impressiveNumbers: any;
</script>

<header class="ds-container" on:dblclick={() => goto('/strategy')}>
	<img class="media" src={mbp15Image} alt="Trading Data" />

	<div class="content">
		<!-- ensure line breaks at correct place on smaller screens -->
		<!-- prettier-ignore -->
		<h1>
			Next generation<br />algorithmic trading protocol
			for decentralised markets
		</h1>

		{#if impressiveNumbers}
			<div class="impressive-numbers">
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
			</div>
		{/if}

		<div class="buttons">
			<a href="/trading-view">Explore DEX Data</a>
			<a class="secondary" href="https://tradingstrategy.ai/docs">Read Documentation</a>
		</div>
	</div>
</header>

<style lang="postcss">
	@custom-media --hero-1-col (width < 1100px);
	@custom-media --hero-2-col (width >= 1100px);

	header {
		--container-max-width: 1960px;
		--container-margin: max(4.5vw, 1.5rem);
		grid-template-columns: 1fr 1fr;
		gap: 2.75rem min(4.5vw, 6.25rem);
		place-items: center;
		padding-block: 4.625rem;
		background: var(--c-background-1);

		@media (--hero-1-col) {
			grid-template-columns: 1fr;
			padding-block: 2rem;
		}
	}

	.media {
		width: 100%;
		margin-block: 5rem;

		@media (--hero-1-col) {
			grid-row: 2 / 3;
			max-width: 40rem;
			margin-block: 0 1rem;
		}
	}

	.content {
		& h1 {
			margin-bottom: 0.625em;
			padding-bottom: 0.625em;
			border-bottom: 4px solid currentColor;

			@media (--hero-1-col) {
				white-space: pre-line;
			}

			@media (width <= 576px) {
				border-bottom-width: 2px;
				font: var(--f-h3-medium);
			}
		}
	}

	.impressive-numbers {
		font: 400 var(--fs-ui-lg);

		@media (width > 576px) {
			font: 400 var(--fs-ui-xl);
		}

		@media (--viewport-md-up) {
			font: 400 var(--fs-ui-xxl);
			letter-spacing: -0.01em;
		}

		& a {
			font-weight: 600;
			text-decoration: underline;
		}
	}

	.buttons {
		display: flex;
		gap: 0.75rem 1.25rem;
		margin-top: 2.5rem;

		@media (width <= 576px) {
			flex-direction: column;
			margin-top: 2rem;
		}

		& a {
			padding: 1rem;
			font: 500 var(--fs-ui-lg);
			text-transform: capitalize;
			text-align: center;
			border: 2px solid var(--c-background-3);
			border-radius: 1.25rem;
			background: var(--c-background-3);
			color: var(--c-text-6);

			@media (width <= 576px) {
				padding-block: 0.75rem;
				border-radius: 1em;
				font: 500 var(--fs-ui-md);
				letter-spacing: 0.01em;
			}

			&.secondary {
				background: transparent;
				color: var(--c-text-1);
				border-color: var(--c-border-2);
			}
		}
	}
</style>
