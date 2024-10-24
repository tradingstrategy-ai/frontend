<script lang="ts">
	import StrategyDifferentiator from './StrategyDifferentiator.svelte';
</script>

<section class="home-hero-banner" data-testid="home-hero-banner">
	<div class="inner ds-container">
		<header>
			<h1>Unleash the power of automated crypto trading</h1>
			<div class="differentiators">
				<StrategyDifferentiator
					title="100% transparent"
					details="All trades, all transactions, 100% transparently visible on the blockchains for you to verify. Building trust through openness."
				/>
				<StrategyDifferentiator
					title="Self-custodial"
					details="Withdraw your crypto whenever you want; Trading Strategy does not have access to your money."
				/>
				<StrategyDifferentiator
					title="No fixed fees"
					details="No fixed monthly fees; strategies collect performance fees only if they generate profits."
				/>
			</div>
		</header>

		<div class="content">
			<enhanced:img src="$lib/assets/misc/mbp-15.webp" sizes="min(1144px, 100vw)" alt="Trading Data" />

			<ol>
				<li>Select a professional-grade strategy aligned with your goals.</li>
				<li>Connect your wallet and deposit funds to the strategy’s vault.</li>
				<li>Track your returns as the strategy trades automatically.</li>
				<li>Adjust your portfolio or withdraw anytime.</li>
			</ol>
		</div>
	</div>
</section>

<style>
	.home-hero-banner {
		background: var(--c-background-accent-1);
		padding: 2rem 0;

		@media (--viewport-md-up) {
			padding: 4rem 2rem;
		}
	}

	.inner {
		display: grid;
		gap: 2.5rem;
	}

	header {
		display: grid;
		gap: 0.5rem;
		justify-items: center;
	}

	h1 {
		text-align: center;
		font: var(--f-heading-xxl-medium);
		letter-spacing: var(--f-heading-xxl-spacing, normal);

		@media (--viewport-md-down) {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);
		}

		@media (--viewport-sm-down) {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}

	.differentiators {
		display: flex;
		gap: 2em;
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing);
		}

		@media (--viewport-xs) {
			display: grid;
			gap: 0.875em;
		}
	}

	.content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(24rem, calc(100vw - 2 * 2rem)), auto));
		gap: min(5rem, 10vw);
		place-items: center;
	}

	ol {
		list-style: none;
		counter-reset: item;
		display: grid;
		gap: 1.5em;
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
		gap: 0.625em;
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
</style>
