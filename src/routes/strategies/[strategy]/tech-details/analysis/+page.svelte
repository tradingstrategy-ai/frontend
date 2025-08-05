<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();
	let { strategy, chartRegistrations, chartId, content } = $derived(data);

	function handleAnalysisChange(this: HTMLSelectElement) {
		goto(`?chart_id=${this.value}`, { noScroll: true });
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
	<p>
		{#await content}
			Loading…
		{:then imageUrl}
			{#if imageUrl}
				<img src={imageUrl} alt="Analysis content" />
			{:else}
				Nothing to display
			{/if}
		{/await}
	</p>
</section>

<style>
	.analysis {
		select {
			border-radius: var(--radius-sm);
			padding: 0.5rem;
			margin-bottom: 1rem;
		}
	}
</style>
