<script lang="ts">
	import type { PageData } from './$types';
	import { AlertList, AlertItem } from '$lib/components';
	import PositionTable from '../PositionTable.svelte';

	export let data: PageData;

	$: summary = data.summary;
	$: state = data.state;
	$: positions = Object.values(state?.portfolio?.open_positions || []);
</script>

<section>
	{#if positions.length > 0}
		<PositionTable strategyId={summary.id} {positions} stats={state?.stats} />
	{:else}
		<AlertList status="warning">
			<AlertItem>This strategy currently has no open positions.</AlertItem>
		</AlertList>
	{/if}
</section>
