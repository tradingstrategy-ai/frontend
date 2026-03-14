<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import heroBackground from '$lib/assets/misc/home-hero-alt-onchain-atlas.svg';
	import heroBackgroundMobile from '$lib/assets/misc/broken-hero.png';
	import StrategyDifferentiator from './StrategyDifferentiator.svelte';
</script>

<section
	class="home-hero-banner"
	data-testid="home-hero-banner"
	style={`--hero-background-image: url(${heroBackground}); --hero-background-image-mobile: url(${heroBackgroundMobile})`}
>
	<div class="inner ds-container">
		<header>
			<h1>Data-driven DeFi vault opportunities</h1>
		</header>

		<div class="content">
			<div class="text">
				<p>Compare and allocate in 3000+ risk-scored vaults using professional metrics and strategies.</p>

				<div class="ctas">
					<Button primaryHeroBanner size="lg" label="Earn with our vaults" href={resolve('/strategies')} />
					<Button secondary size="lg" label="Explore vault data" href={resolve('/trading-view/vaults')} />
				</div>

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
		padding: clamp(1rem, 2vw, 2rem) 0;
		background: transparent;

		@media (--viewport-sm-down) {
			padding: 0.75rem 0;
		}

		@media (--viewport-xs) {
			padding: 0;
		}
	}

	.inner {
		position: relative;
		overflow: clip;
		isolation: isolate;
		display: grid;
		width: var(--container-width);
		max-width: var(--container-max-width);
		margin-inline: auto;
		gap: clamp(1.5rem, 3vw, 2.75rem);
		min-height: min(42rem, 68vh);
		align-content: center;
		padding: clamp(2.25rem, 3.5vw, 3.5rem) clamp(1.5rem, 4vw, 3rem);
		border: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 18%);
		border-radius: clamp(1.75rem, 2.5vw, 2.5rem);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-box-1), transparent 2%),
				color-mix(in srgb, var(--c-box-1), transparent 0%)
			),
			radial-gradient(circle at top right, color-mix(in srgb, var(--c-bullish), transparent 92%), transparent 42%),
			linear-gradient(135deg, color-mix(in srgb, var(--c-text-light), transparent 94%), transparent 34%), var(--c-box-1);
		box-shadow:
			0 1.75rem 3.5rem color-mix(in srgb, var(--c-text-inverted), transparent 76%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 76%),
			inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 94%);

		@media (--viewport-sm-down) {
			min-height: min(33rem, 66vh);
			padding: 2rem 1.25rem 5.25rem;
			gap: 2rem;
			border-radius: 1.5rem;
		}

		@media (--viewport-xs) {
			min-height: min(31rem, 64vh);
			padding: 1.75rem 1rem 4.75rem;
			border-radius: 1.25rem;
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
		transform: scale(1.01);
		filter: saturate(1.06) brightness(1.1);
	}

	.inner::after {
		z-index: -1;
		background:
			radial-gradient(
				circle at 22% 34%,
				color-mix(in srgb, var(--c-text-inverted), transparent 10%) 0%,
				color-mix(in srgb, var(--c-text-inverted), transparent 32%) 30%,
				transparent 62%
			),
			linear-gradient(
				90deg,
				color-mix(in srgb, var(--c-text-inverted), transparent 1%) 0%,
				color-mix(in srgb, var(--c-text-inverted), transparent 6%) 22%,
				color-mix(in srgb, var(--c-text-inverted), transparent 20%) 44%,
				color-mix(in srgb, var(--c-text-inverted), transparent 54%) 74%,
				color-mix(in srgb, var(--c-text-inverted), transparent 78%) 100%
			),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-text-inverted), transparent 84%) 0%,
				color-mix(in srgb, var(--c-text-inverted), transparent 64%) 100%
			);
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
		text-shadow: 0 0.1rem 1.6rem color-mix(in srgb, var(--c-text-inverted), transparent 62%);

		@media (--viewport-lg-down) {
			font: var(--f-heading-xxl-medium);
			letter-spacing: var(--f-heading-xxl-spacing, normal);
		}

		@media (--viewport-md-down) {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);
		}

		@media (--viewport-sm-down) {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
			margin-bottom: 60px;
		}
	}

	.content {
		display: grid;
		max-width: 44rem;
		align-items: start;
		justify-items: start;

		@media (--viewport-lg-down) {
			max-width: 40rem;
		}
	}

	.text {
		display: grid;
		gap: 1.75rem;
		max-width: 42rem;
	}

	:global(.home-hero-banner .text .button) {
		justify-self: start;
		box-shadow: 0 1.1rem 2.6rem color-mix(in srgb, var(--c-text-inverted), transparent 74%);
	}

	p {
		color: var(--c-text-light);
		font: var(--f-heading-md-roman);
		letter-spacing: var(--f-heading-md-spacing, normal);
		max-width: 38rem;
		text-wrap: pretty;
		text-shadow: 0 0.1rem 1.4rem color-mix(in srgb, var(--c-text-inverted), transparent 68%);

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

	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}

	:global(.home-hero-banner .ctas .button) {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		border-color: color-mix(in srgb, var(--c-text-light), transparent 42%);
		backdrop-filter: blur(0.9rem) saturate(1.18);
		box-shadow:
			0 1.25rem 3rem color-mix(in srgb, var(--c-text-inverted), transparent 78%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 32%),
			inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 82%),
			inset 0 -1.5rem 2.5rem color-mix(in srgb, var(--c-text-inverted), transparent 88%);
	}

	:global(.home-hero-banner .ctas .button)::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				115deg,
				transparent 0%,
				color-mix(in srgb, var(--c-text-light), transparent 76%) 28%,
				transparent 54%
			),
			radial-gradient(circle at top left, color-mix(in srgb, var(--c-text-light), transparent 72%) 0%, transparent 42%);
		opacity: 0.75;
		pointer-events: none;
		mix-blend-mode: screen;
	}

	:global(.home-hero-banner .ctas .button.secondary) {
		color: var(--c-text);
		border-color: color-mix(in srgb, var(--c-text-light), transparent 58%);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-box-1), transparent 12%),
				color-mix(in srgb, var(--c-box-1), transparent 24%) 52%,
				color-mix(in srgb, var(--c-text-inverted), transparent 92%)
			),
			linear-gradient(135deg, color-mix(in srgb, var(--c-text-light), transparent 97%), transparent 52%),
			color-mix(in srgb, var(--c-box-1), transparent 22%);
		box-shadow:
			0 0.45rem 1rem color-mix(in srgb, var(--c-text-inverted), transparent 92%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 48%),
			inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 92%);
	}

	:global(.home-hero-banner .ctas .button.secondary)::before {
		opacity: 0.18;
		background:
			linear-gradient(
				115deg,
				transparent 0%,
				color-mix(in srgb, var(--c-text-light), transparent 92%) 34%,
				transparent 62%
			),
			radial-gradient(circle at top left, color-mix(in srgb, var(--c-text-light), transparent 90%) 0%, transparent 40%);
	}

	:global(.home-hero-banner .ctas .button.secondary):is(:hover, :focus):not([disabled]) {
		color: var(--c-text);
		border-color: color-mix(in srgb, var(--c-text-light), transparent 48%);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-box-1), transparent 10%),
				color-mix(in srgb, var(--c-box-1), transparent 20%) 52%,
				color-mix(in srgb, var(--c-text-inverted), transparent 90%)
			),
			linear-gradient(135deg, color-mix(in srgb, var(--c-text-light), transparent 95%), transparent 50%),
			color-mix(in srgb, var(--c-box-1), transparent 18%);
		box-shadow:
			0 0.6rem 1.25rem color-mix(in srgb, var(--c-text-inverted), transparent 90%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 42%),
			inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 90%);
	}

	@media (--viewport-sm-down) {
		.ctas {
			display: grid;
			width: 100%;
		}

		:global(.home-hero-banner .ctas .button) {
			width: 100%;
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

	@media (--viewport-md-down) {
		.inner::before {
			background-position: 68% center;
			transform: scale(1.04);
		}

		.inner::after {
			background:
				radial-gradient(
					circle at 24% 22%,
					color-mix(in srgb, var(--c-text-inverted), transparent 18%) 0%,
					transparent 56%
				),
				linear-gradient(
					180deg,
					color-mix(in srgb, var(--c-text-inverted), transparent 4%) 0%,
					color-mix(in srgb, var(--c-text-inverted), transparent 18%) 38%,
					color-mix(in srgb, var(--c-text-inverted), transparent 42%) 100%
				),
				linear-gradient(
					90deg,
					color-mix(in srgb, var(--c-text-inverted), transparent 12%) 0%,
					color-mix(in srgb, var(--c-text-inverted), transparent 62%) 100%
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
		.inner {
			min-height: min(31rem, 62vh);
			padding: 2rem 1.25rem 3rem;
			gap: 2.125rem;
		}

		.inner::before {
			content: '';
			inset: 0;
			background-image: var(--hero-background-image-mobile);
			background-position: center;
			background-size: contain;
			/*
			background-position: center top;
			background-repeat: no-repeat;
			background-size: 200% auto;
			transform: none;*/
			/*filter: saturate(1.1) brightness(1.22);*/
		}

		.inner::after {
			background:
				radial-gradient(
					circle at 28% 18%,
					color-mix(in srgb, var(--c-text-inverted), transparent 12%) 0%,
					transparent 48%
				),
				linear-gradient(
					180deg,
					color-mix(in srgb, var(--c-text-inverted), transparent 8%) 0%,
					color-mix(in srgb, var(--c-text-inverted), transparent 14%) 18%,
					color-mix(in srgb, var(--c-text-inverted), transparent 36%) 42%,
					color-mix(in srgb, var(--c-box-1), transparent 8%) 70%,
					var(--c-box-1) 100%
				),
				linear-gradient(
					90deg,
					color-mix(in srgb, var(--c-text-inverted), transparent 6%) 0%,
					color-mix(in srgb, var(--c-text-inverted), transparent 28%) 100%
				);
		}

		header,
		.content,
		.text,
		p {
			max-width: 100%;
		}

		.text {
			gap: 2rem;
		}

		.ctas {
			margin-top: 0.5rem;
		}

		.differentiators {
			display: grid;
			grid-template-columns: repeat(2, max-content);
			justify-content: center;
			gap: 0.5rem 0.875rem;
		}

		:global(.home-hero-banner .differentiators > :last-child) {
			grid-column: 1 / -1;
			justify-self: center;
		}
	}

	@media (--viewport-xs) {
		.inner {
			min-height: min(29rem, 60vh);
			padding: 1.75rem 1rem 2.5rem;
			gap: 1.875rem;
		}

		.text {
			gap: 1.75rem;
		}

		.ctas {
			margin-top: 0.375rem;
		}

		.differentiators {
			gap: 0.5rem 0.875rem;
		}
	}
</style>
