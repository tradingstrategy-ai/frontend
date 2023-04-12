<script lang="ts">
	import equityData from './equityData.json';
	import Chart from './Chart.svelte';
	import { Button, Section } from '$lib/components';

	let showLine = false;
</script>

<Section gap="sm">
	<h2>Equity vs. buy-and-hold</h2>
	<div style:width="10rem" style:display="grid">
		<Button label="{showLine ? 'Hide' : 'Show'} line" on:click={() => (showLine = !showLine)} />
	</div>

	<Chart {equityData} {showLine} />
</Section>
