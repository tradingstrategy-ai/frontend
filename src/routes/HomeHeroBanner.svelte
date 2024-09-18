<!--
@component
Home page hero banner.

#### Usage:
```tsx
<HeroBanner />
```
-->
<script lang="ts">
	import { Button } from '$lib/components';
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<header class="home-hero-banner" data-testid="home-hero-banner">
	<div class="inner ds-container">
		<enhanced:img src="$lib/assets/misc/mbp-15.webp" sizes="min(1144px, 100vw)" alt="Trading Data" />

		<div class="content">
			<!-- ensure line breaks at correct place -->
			<h1>Harness the power of algorithmic crypto trading</h1>

			<hr />

			<ol>
				<li>Select a professional-grade strategy aligned with your goals.</li>
				<li>Connect your crypto wallet and deposit funds to a blockchain vault.</li>
				<li>Track your returns as the strategy trades automatically.</li>
				<li>Adjust your portfolio or withdraw anytime.</li>
			</ol>

			<div class="buttons">
				<Button href="/strategies">Start trading</Button>
				<Button ghost href="https://github.com/tradingstrategy-ai/getting-started" target="_blank" rel="noreferrer">
					For developers
				</Button>
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
	}

	ol {
		list-style: none;
		counter-reset: item;
		display: grid;
		gap: 0.5em;
		padding: 0;
		font: var(--f-ui-xl-roman);
		letter-spacing: var(--f-ui-xl-spacing, normal);

		@media (--viewport-xl-down) {
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-lg-spacing, normal);
		}

		@media (--viewport-sm-down) {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}
	}

	li {
		counter-increment: item;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5em;
	}

	li:before {
		content: counter(item);
		height: 1.625em;
		aspect-ratio: 1;
		display: grid;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: color-mix(in srgb, transparent, var(--c-success) 35%);
		color: color-mix(in srgb, var(--c-text), var(--c-success) 70%);
		font-size: 0.9em;
		font-weight: bold;
	}

	.buttons {
		display: flex;
		gap: 1.25rem;
		margin-top: 2.5rem;

		:global([data-css-props]:first-child) {
			--button-padding: 0.75rem 2.5rem;
		}

		@media (--viewport-xs) {
			flex-direction: column;
		}
	}

	hr {
		border: 1px solid var(--c-text);
		margin-block: var(--space-lg);
	}
</style>
