<script lang="ts">
	import type { PageData } from './$types';
	import { PageHeading } from '$lib/components';
	import StrategyList from './StrategyList.svelte';

	export let data: PageData;
	$: strategies = data.strategies;
</script>

<main class="ds-container">
	<PageHeading>
		<h1>Strategies</h1>
		<p>Currently available strategies</p>
	</PageHeading>

	{#if strategies.length}
		<StrategyList {strategies} />
	{:else}
		<p>No strategies configured</p>
	{/if}
</main>

<style>
	main h1 {
		margin-top: 1.25rem;
	}
</style>
