<script lang="ts">
	let { data } = $props();
	let { strategy } = $derived(data);
</script>

<svelte:head>
	<title>Analysis | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Analysis charts and tables for {strategy.name} strategy" />
</svelte:head>

<section class="analysis">Analysis coming soon.</section>

<style>
</style>
