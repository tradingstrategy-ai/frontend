<script lang="ts">
	import type { PageData } from './$types';
	import { PageHeading } from '$lib/components';
	import StrategyList from './StrategyList.svelte';

	export let data: PageData;
	$: strategies = data.strategies;
</script>

<main class="ds-container">
	<PageHeading title="<h1>Strategies</h1>" subtitle="<p>Currently available strategies</p>" />

	{#if strategies.length}
		<StrategyList {strategies} />
	{:else}
		<p>No strategies configured</p>
	{/if}
</main>
