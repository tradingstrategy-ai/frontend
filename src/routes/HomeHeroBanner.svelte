<!--
@component
Home page hero banner.

#### Usage:
```tsx
<HeroBanner />
```
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import mbp15Image from '$lib/assets/misc/mbp-15.webp';
	import { Button } from '$lib/components';
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<header class="home-hero-banner" data-testid="home-hero-banner" on:dblclick={() => goto('/strategies')}>
	<div class="inner ds-container">
		<img class="media" src={mbp15Image} alt="Trading Data" />

		<div class="content">
			<h1>
				<!-- ensure line breaks at correct place on larger screens -->
				Next generation <br />algorithmic trading protocol <br />for decentralised markets
			</h1>

			<hr />

			<p>Develop trading strategies, automate trade execution and research market data.</p>

			<div class="buttons">
				<Button href="/trading-view">Explore DEX Data</Button>
				<Button secondary href="https://tradingstrategy.ai/docs" rel="external">Read Documentation</Button>
			</div>
		</div>
	</div>
</header>

<style lang="postcss">
	.home-hero-banner {
		background: var(--c-background-accent-1);
		padding: var(--space-xl) 0;
		@media (--viewport-md-up) {
			padding: var(--space-10xl) var(--space-3xl);
		}
	}

	.inner {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(24rem, calc(100vw - 2 * var(--space-xl))), auto));
		gap: min(var(--space-8xl), 10vw);
		place-items: center;
	}

	h1 {
		font: var(--f-heading-xxl-medium);
		letter-spacing: var(--f-heading-xxl-spacing, normal);

		@media (--viewport-xl-down) {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);
		}

		@media (--viewport-sm-down) {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}

		@media (--viewport-xl-down) {
			br {
				display: none;
			}
		}
	}

	p {
		font: var(--f-ui-xl-roman);
		letter-spacing: var(--f-ui-xl-spacing, normal);
	}

	.buttons {
		display: grid;
		gap: var(--space-ls);
		grid-template-columns: repeat(auto-fit, minmax(12rem, auto));
		margin-top: var(--space-xl);
	}

	hr {
		border: 1px solid var(--c-text);
		margin-block: var(--space-lg);
	}
</style>
