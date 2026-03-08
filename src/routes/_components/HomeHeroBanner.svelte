<script lang="ts">
	import StrategyDifferentiator from './StrategyDifferentiator.svelte';
</script>

<section class="home-hero-banner" data-testid="home-hero-banner">
	<div class="inner ds-container">
		<header>
			<h1>The best DeFi vaults and trading strategies</h1>
		</header>

		<div class="content">
			<enhanced:img class="media" src="$lib/assets/misc/mbp-15.webp" sizes="min(1144px, 100vw)" alt="Trading Data" />

			<div class="text">
				<p>
					<a href="/blog/announcing-master-vault-strategy">Allocate to the best-performing vaults</a> with automated
					Vault-of-Vaults strategies. <a href="/trading-view/vaults">Find and compare</a> the most profitable vaults across
					all blockchains.
				</p>

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
			</div>
		</div>
	</div>
</section>

<style>
	.home-hero-banner {
		background: var(--c-background-accent-1);
		padding: 5rem 2rem;

		@media (--viewport-sm-down) {
			padding: 3rem 0;
		}

		@media (--viewport-xs) {
			padding: 2rem 0;
		}
	}

	.inner {
		display: grid;
		gap: 4rem;

		@media (--viewport-sm-down) {
			gap: 2.5rem;
		}
	}

	header {
		display: grid;
		gap: 0.5rem;
		justify-items: center;
	}

	h1 {
		text-align: center;
		font: var(--f-heading-xxxl-medium);
		letter-spacing: var(--f-heading-xxxl-spacing, normal);

		@media (--viewport-lg-down) {
			font: var(--f-heading-xxl-medium);
			letter-spacing: var(--f-heading-xxl-spacing, normal);
		}

		@media (--viewport-md-down) {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);
		}

		@media (--viewport-sm-down) {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}

	.text {
		display: grid;
		gap: 2rem;
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

	.media {
		width: 100%;
		max-width: 420px;
		height: auto;
	}

	.content {
		display: grid;
		grid-template-columns: 2fr 4fr;
		gap: 3rem;
		align-items: start;
		justify-items: center;

		@media (--viewport-lg-down) {
			grid-template-columns: auto auto;
		}

		@media (--viewport-md-down) {
			grid-template-columns: auto;
		}

		@media (--viewport-md-down) {
			> * {
				max-width: 80vw;
			}
		}
	}

	p {
		color: var(--c-text-light);
		font: var(--f-heading-md-roman);
		letter-spacing: var(--f-heading-md-spacing, normal);

		@media (--viewport-xl-down) {
			font: var(--f-heading-sm-roman);
			letter-spacing: var(--f-heading-sm-spacing, normal);
		}

		@media (--viewport-lg-down) {
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);
		}

		@media (--viewport-sm-down) {
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-lg-spacing, normal);
		}
	}

	p a {
		text-decoration: underline;
		font-weight: bold;
		color: var(--c-text);
	}
</style>
