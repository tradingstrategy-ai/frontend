<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { Button, Icon, Section } from '$lib/components';
	import StrategyTile from './strategies/StrategyTile.svelte';
	import StrategyDifferentiator from './StrategyDifferentiator.svelte';
	import { formatDaysAgo } from '$lib/helpers/formatters';
	import { getStrategyChartDateRange } from 'trade-executor/chart/helpers';

	export let strategies: StrategyRuntimeState[];

	function calculateOpenStrategiesLiveDuration() {
		const launchAt = new Date(2024, 3, 15);
		const daysText = formatDaysAgo(launchAt.getTime() / 1000);
		return daysText;
	}

	const openLiveDays = calculateOpenStrategiesLiveDuration();
	const chartDateRange = getStrategyChartDateRange(strategies);
</script>

<Section padding="xl">
	<h2>Open strategies</h2>
	<div class="differentiators">
		<p>
			Open strategies have been live for {openLiveDays}. Our strategies are:
		</p>
		<ul>
			<StrategyDifferentiator
				title="100% transparent"
				details="Automated trading on your behalf, using strategies developed by experienced traders."
			/>
			<StrategyDifferentiator
				title="Self-custodial"
				details="Withdraw your crypto whenever you want; Trading Strategy does not have access to your money."
			/>
			<StrategyDifferentiator
				title="Cost-efficient"
				details="No fixed monthly fees; strategies collect performance fees only if they generate profits."
			/>
		</ul>
	</div>
	<div class="strategies">
		{#each strategies as strategy (strategy.id)}
			<StrategyTile {strategy} {chartDateRange} />
		{:else}
			<p class="strategies-fallback">Check back soon to see top-performing strategies.</p>
		{/each}
	</div>

	<div class="strategies-cta">
		<Button secondary label="See all strategies" href="/strategies" />
	</div>
</Section>

<style lang="postcss">
	.strategies {
		--strategy-tile-gap: 1.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: var(--strategy-tile-gap);
		justify-content: center;
		padding: 3rem 0;
		overflow: hidden;

		> :global(*) {
			flex: 1;
			min-width: min(27.25rem, 100%);

			@media (--viewport-lg-up) {
				/* limit tile width */
				max-width: 36rem;

				/* solo tile on last row should have same width as others */
				&:nth-child(2n + 3) {
					max-width: calc((100% - var(--strategy-tile-gap)) / 2);
				}
			}

			/* force single column below 1024px */
			@media (--viewport-md-down) {
				min-width: 100%;
			}
		}
	}

	:is(h2, .strategies-fallback, .strategies-cta) {
		text-align: center;
	}

	.differentiators {
		border: 1px solid var(--c-text-ultra-light);
		border-radius: var(--radius-md);
		width: 100%;
		max-width: 52rem;
		margin: 1.5rem auto 0 auto;
		padding: 1.5rem 1.25rem;
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing);
		color: var(--c-text-light);
		text-align: center;

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing);
		}

		ul {
			list-style-type: none;
			margin-top: 1.25rem;
			padding: 0;
			display: grid;
			gap: 1.5em;
			grid-template-columns: repeat(3, 1fr);
			align-items: flex-start;

			@media (--viewport-xs) {
				grid-template-columns: 1fr;
			}
		}
	}
</style>
