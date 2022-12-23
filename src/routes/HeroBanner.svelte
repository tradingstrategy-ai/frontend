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

	export let impressiveNumbers: any;
</script>

<header class="ds-container" on:dblclick={() => goto('/strategies')}>
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
		--container-margin: max(4.5vw, var(--space-lg));
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4xl) min(4.5vw, 6.25rem);
		place-items: center;
		padding-block: 4.625rem;
		background: var(--c-background-1-v1);

		@media (--hero-1-col) {
			grid-template-columns: 1fr;
			padding-block: var(--space-xl);
		}
	}

	.media {
		width: 100%;
		margin-block: 5rem;
		aspect-ratio: 286 / 173;

		@media (--hero-1-col) {
			grid-row: 2 / 3;
			max-width: 40rem;
			margin-block: 0 var(--space-md);
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

			@media (--viewport-xs) {
				border-bottom-width: 2px;
				font: var(--f-h3-medium);
			}
		}
	}

	.impressive-numbers {
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		@media (--viewport-sm-up) {
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);
		}

		@media (--viewport-md-up) {
			font: var(--f-ui-xxl-roman);
			letter-spacing: var(--f-ui-xxl-spacing, normal);
		}

		& a {
			font-weight: 600;
			text-decoration: underline;
		}
	}

	.buttons {
		display: flex;
		gap: var(--space-sl) var(--space-ls);
		margin-top: var(--space-3xl);

		@media (--viewport-xs) {
			flex-direction: column;
			margin-top: var(--space-xl);
		}

		& a {
			padding: var(--space-md);
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--f-ui-lg-spacing, normal);
			text-transform: capitalize;
			text-align: center;
			border: 2px solid var(--c-background-3-v1);
			border-radius: var(--radius-md);
			background: var(--c-background-3-v1);
			color: var(--c-text-6-v1);

			@media (--viewport-xs) {
				padding-block: var(--space-sl);
				border-radius: 1em;
				font: var(--f-ui-md-medium);
				letter-spacing: var(--f-ui-md-spacing, normal);
			}

			&.secondary {
				background: transparent;
				color: var(--c-text-1-v1);
				border-color: var(--c-border-2-v1);
			}
		}
	}
</style>
