<script lang="ts">
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { Alert, Button, Section } from '$lib/components';
	import {
		type ChainOption,
		default as ChainFilter,
		getChainOptions,
		matchesChainOption
	} from 'trade-executor/components/ChainFilter.svelte';
	import StrategyTile from './strategies/StrategyTile.svelte';
	import { getStrategyChartDateRange } from 'trade-executor/chart/helpers';

	export let strategies: StrategyRuntimeState[];

	let selected: ChainOption = 'all';

	$: filteredStrategies = strategies.filter((s) => matchesChainOption(s, selected));

	const chartDateRange = getStrategyChartDateRange(strategies);
</script>

<Section padding="md">
	<h2>Open strategies</h2>
	<div class="filters">
		<ChainFilter options={getChainOptions(strategies)} bind:selected />
	</div>
	<div class="strategies">
		{#each filteredStrategies as strategy (strategy.id)}
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

	.filters {
		display: flex;
		gap: 1.25rem;
		justify-content: center;
		margin-top: 1rem;
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
