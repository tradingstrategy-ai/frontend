<script lang="ts">
	import { PageHeading, Section, SegmentedControl } from '$lib/components';
	import StrategyTile from './StrategyTile.svelte';

	export let data;
	$: ({ admin, strategies } = data);

	const options = ['all', 'live', 'unpublished'] as const;
	let filter: (typeof options)[number] = 'all';

	$: filteredStrategies = strategies.filter((s) => {
		if (!admin || filter === 'all') return true;

		// return live strategies for "live" filter; others for "unpublished" filter
		const liveFilter = filter === 'live';
		const liveStrategy = s.connected && s.tags.includes('live');
		return liveFilter === liveStrategy;
	});
</script>

<svelte:head>
	<title>Automated DeFi Strategies | Trading Strategy</title>
	<meta name="description" content="Browse currently available automated DeFi trading strategies" />
</svelte:head>

<main class="strategies-index-page ds-3">
	<Section>
		<PageHeading title="Strategies" description="Currently available automated trading strategies for you">
			<svelte:fragment slot="cta">
				{#if admin}
					<SegmentedControl bind:selected={filter} {options} />
				{/if}
			</svelte:fragment>
		</PageHeading>

		{#if filteredStrategies.length}
			<div class="strategy-tiles" data-testid="strategy-tiles">
				{#each filteredStrategies as strategy (strategy.id)}
					<StrategyTile {admin} {strategy} />
				{/each}
			</div>
		{:else}
			<p>Currently no open strategies available.</p>

			<p>
				<a class="body-link" href="/community">Join Discord to get access</a>.
			</p>
		{/if}
	</Section>
</main>

<style>
	.strategies-index-page {
		margin-top: 1.25rem;
	}

	.strategy-tiles {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;

		@media (--viewport-md-down) {
			grid-template-columns: 1fr;
		}
	}
</style>
