<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { Alert, Button, Section } from '$lib/components';
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
	<p class="live-ago">
		Open strategies have been live for {openLiveDays}.
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
	<div class="strategies">
		{#each strategies as strategy (strategy.id)}
			<StrategyTile {strategy} {chartDateRange} />
		{:else}
			<div class="fallback">
				<Alert size="sm" status="info">Check back soon to see top-performing strategies.</Alert>
			</div>
		{/each}
	</div>

	<div class="cta">
		<Button secondary label="See all strategies" href="/strategies" />
	</div>
</Section>

<style lang="postcss">
	:is(h2, p, .cta) {
		text-align: center;
	}

	p.live-ago {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing);
		color: var(--c-text-extra-light);
	}

	.differentiators {
		margin-top: 0.75rem;
		display: flex;
		gap: 2em;
		justify-content: center;
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
</style>
