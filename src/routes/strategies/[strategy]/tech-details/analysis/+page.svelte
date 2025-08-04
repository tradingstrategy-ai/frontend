<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();
	let { strategy, chartRegistrations, chartId } = $derived(data);

	function handleAnalysisChange(this: HTMLSelectElement) {
		goto(`?chart_id=${this.value}`);
	}
</script>

<svelte:head>
	<title>Analysis | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Analysis charts and tables for {strategy.name} strategy" />
</svelte:head>

<section class="analysis">
	<p>
		<select onchange={handleAnalysisChange}>
			<option value="">Select analysis</option>
			{#each chartRegistrations as { id, name } (id)}
				<option value={id} selected={id === chartId}>{name}</option>
			{/each}
		</select>
	</p>
</section>

<style>
	.analysis {
		select {
			border-radius: var(--radius-sm);
			padding: 0.5rem;
		}
	}
</style>
