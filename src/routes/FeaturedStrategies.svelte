<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { Button, Section } from '$lib/components';
	import StrategyTile from './strategies/StrategyTile.svelte';
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
	<p class="live-ago">
		Open strategies have been live for {openLiveDays}.
	</p>
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

				/* lone tile on last row should have same width as others */
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

	:is(h2, .strategies-fallback, .strategies-cta, .live-ago) {
		text-align: center;
	}

	.live-ago {
		max-width: 48ch;
		margin: 0 auto;
		color: var(--c-text-extra-light);
	}
</style>
