<script lang="ts">
	import type { PageData } from '../closed-positions/$types';
	import { AlertList, AlertItem } from '$lib/components';
	import PositionTable from '../PositionTable.svelte';

	export let data: PageData;

	$: state = data.state;
	$: positions = Object.values(state?.portfolio?.closed_positions || []);
</script>

<section style:overflow="auto">
	{#if positions.length > 0}
		<PositionTable {positions} positionType="closed" stats={state?.stats} />
	{:else}
		<AlertList status="warning">
			<AlertItem>This strategy currently has no closed positions.</AlertItem>
		</AlertList>
	{/if}
</section>
