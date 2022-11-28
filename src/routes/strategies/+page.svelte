<script lang="ts">
	import type { PageData } from './$types';
	import { PageHeading, StrategiesListing } from '$lib/components';

	export let data: PageData;
	$: strategies = data.strategies;
</script>

<main class="ds-container">
	<PageHeading title="<h1>Strategies</h1>" subtitle="<p>Currently available strategies</p>" />

	{#if strategies.length}
		<StrategiesListing {strategies} />
	{:else}
		<p>No strategies configured</p>
	{/if}
</main>
