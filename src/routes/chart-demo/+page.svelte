<script lang="ts">
	import equityData from './equityData.json';
	import buyHoldData from './buyHoldData.json';
	import Chart from './Chart.svelte';
	import { Button, Section } from '$lib/components';

	let showLines = false;

  function toggleLines({ currentTarget }) {
    showLines = !showLines;
    currentTarget.blur();
  }
</script>

<Section gap="sm">
	<h2>Equity vs. buy-and-hold</h2>
	<div style:width="10rem" style:display="grid">
		<Button label="{showLines ? 'Hide' : 'Show'} lines" on:click={toggleLines} />
	</div>

	<Chart {equityData} {buyHoldData} {showLines} />
</Section>
