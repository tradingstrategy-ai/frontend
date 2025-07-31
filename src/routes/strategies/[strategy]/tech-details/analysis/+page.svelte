<script lang="ts">
	let { data } = $props();
	let { strategy, chartRegistrations } = $derived(data);
</script>

<svelte:head>
	<title>Analysis | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Analysis charts and tables for {strategy.name} strategy" />
</svelte:head>

<section class="analysis">
	<h2>Available charts and tables</h2>
	<ul>
		{#each chartRegistrations as { id } (id)}
			<li>{id}</li>
		{/each}
	</ul>
</section>

<style>
	.analysis {
		h2 {
			margin-bottom: 1rem;
			font: var(--f-heading-sm-medium);
			letter-spacing: var(--ls-heading-sm, normal);
		}
	}
</style>
