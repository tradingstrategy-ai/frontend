<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { Alert, Button, Section } from '$lib/components';
	import StrategyTile from './strategies/StrategyTile.svelte';
	import StrategyDifferentiator from './StrategyDifferentiator.svelte';
	import { getStrategyChartDateRange } from 'trade-executor/chart/helpers';

	export let strategies: StrategyRuntimeState[];

	const chartDateRange = getStrategyChartDateRange(strategies);
</script>

<Section padding="md">
	<h2>Open strategies</h2>
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
			<StrategyTile simplified {strategy} {chartDateRange} />
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

<style>
	:is(h2, .cta) {
		text-align: center;
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
		--gap: 1.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: var(--gap);
		justify-content: center;
		padding: 3rem 0;

		/* custom method to ensure equal width strategy tiles in flex layout */
		--num-gaps: calc(var(--columns) - 1);
		--total-gap-width: calc(var(--num-gaps) * var(--gap));
		--available-width: calc(100% - var(--total-gap-width));
		--column-width: calc(var(--available-width) / var(--columns));

		/* small viewport (default): 1 col */
		--columns: 1;

		/* mid-size viewport: 2 cols */
		@media (width >= 896px) {
			--columns: 2;
		}

		/* large viewport (default): 3 cols */
		@media (width >= 1356px) {
			--columns: 3;
		}

		> :global(*) {
			width: var(--column-width);
		}
	}
</style>
