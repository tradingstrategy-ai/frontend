<script lang="ts">
	import StrategyDifferentiator from './StrategyDifferentiator.svelte';
	import Button from '$lib/components/Button.svelte';
	import heroBackground from '$lib/assets/misc/home-hero-yield-discovery.svg';
</script>

<section
	class="home-hero-banner"
	data-testid="home-hero-banner"
	style={`--hero-background-image: url(${heroBackground})`}
>
	<div class="inner ds-container">
		<header>
			<h1>Find the Best Vaults.<br />Risk-Scored. Verified Onchain.</h1>
		</header>

		<div class="content">
			<div class="text">
				<p>
					3000+ risk-scored vaults across 20+ blockchains — professional metrics, rankings, and quantitative research
					tools.
				</p>
				<Button size="lg" label="See top vaults today" href="/trading-view/vaults" --button-padding="1rem 2.5rem" />

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
		padding: clamp(2rem, 3vw, 3rem);
		background: var(--c-background-accent-1);

		@media (--viewport-sm-down) {
			padding: 1rem 0;
		}

		@media (--viewport-xs) {
			padding: 0;
		}
	}

	.inner::before,
	.inner::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
	}

	.inner::before {
		z-index: -2;
		background-image: var(--hero-background-image);
		background-position: center right;
		background-repeat: no-repeat;
		background-size: cover;
		transform: scale(1.02);
	}

	.inner::after {
		z-index: -1;
		background:
			linear-gradient(
				90deg,
				color-mix(in srgb, var(--c-text-inverted), transparent 8%) 0%,
				color-mix(in srgb, var(--c-text-inverted), transparent 12%) 26%,
				color-mix(in srgb, var(--c-text-inverted), transparent 34%) 48%,
				color-mix(in srgb, var(--c-text-inverted), transparent 64%) 74%,
				color-mix(in srgb, var(--c-text-inverted), transparent 80%) 100%
			),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-text-inverted), transparent 82%) 0%,
				color-mix(in srgb, var(--c-text-inverted), transparent 58%) 100%
			);
	}

	.inner {
		position: relative;
		overflow: clip;
		isolation: isolate;
		display: grid;
		gap: clamp(2rem, 4vw, 3.5rem);
		min-height: min(48rem, 78vh);
		align-content: center;
		padding: clamp(2.5rem, 4vw, 4.5rem) clamp(1.5rem, 4vw, 3rem);
		border: 1px solid var(--c-box-3);
		border-radius: clamp(1.75rem, 2.5vw, 2.5rem);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--c-box-1), transparent 10%), color-mix(in srgb, var(--c-box-1), transparent 0%)),
			radial-gradient(circle at top right, color-mix(in srgb, var(--c-bullish), transparent 88%), transparent 38%),
			var(--c-box-1);
		box-shadow: inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 88%);

		@media (--viewport-sm-down) {
			min-height: min(42rem, 82vh);
			padding: 2.25rem 1.25rem;
			gap: 2rem;
			border-radius: 1.5rem;
		}

		@media (--viewport-xs) {
			min-height: auto;
			padding: 2rem 1rem;
			border-radius: 0;
			border-inline: 0;
		}
	}

	header {
		display: grid;
		gap: 0.5rem;
		justify-items: start;
		max-width: 44rem;
	}

	h1 {
		text-wrap: balance;
		font: var(--f-heading-xxxl-medium);
		letter-spacing: var(--f-heading-xxxl-spacing, normal);
		text-shadow: 0 0.1rem 1.6rem hsl(208 59% 7% / 0.32);

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
		gap: 1.75rem;
		max-width: 42rem;

		:global(.button) {
			justify-self: start;
			box-shadow: 0 1.1rem 2.6rem hsl(208 59% 7% / 0.28);
		}
	}

	.differentiators {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2rem;
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
		max-width: 44rem;
		gap: 0;
		align-items: start;
		justify-items: start;

		@media (--viewport-lg-down) {
			max-width: 40rem;
		}
	}

	p {
		color: var(--c-text-light);
		font: var(--f-heading-md-roman);
		letter-spacing: var(--f-heading-md-spacing, normal);
		max-width: 38rem;
		text-wrap: pretty;
		text-shadow: 0 0.1rem 1.4rem hsl(208 59% 7% / 0.3);

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

	@media (--viewport-md-down) {
		.inner::before {
			background-position: 68% center;
			transform: scale(1.06);
		}

		.inner::after {
			background:
				linear-gradient(
					180deg,
					color-mix(in srgb, var(--c-text-inverted), transparent 10%) 0%,
					color-mix(in srgb, var(--c-text-inverted), transparent 28%) 38%,
					color-mix(in srgb, var(--c-text-inverted), transparent 52%) 100%
				),
				linear-gradient(
					90deg,
					color-mix(in srgb, var(--c-text-inverted), transparent 28%) 0%,
					color-mix(in srgb, var(--c-text-inverted), transparent 68%) 100%
				);
		}

		header,
		.content,
		.text,
		p {
			max-width: min(100%, 34rem);
		}
	}

	@media (--viewport-sm-down) {
		.inner::before {
			background-position: 70% center;
			transform: scale(1.1);
		}

		header,
		.content,
		.text,
		p {
			max-width: 100%;
		}
	}
</style>
