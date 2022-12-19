<script lang="ts">
	import type { PageData } from './$types';
	import { createCombinedPositionList } from 'trade-executor-frontend/state/stats';
	import { AlertList, AlertItem } from '$lib/components';
	import PositionTable from '../PositionTable.svelte';

	export let data: PageData;

	$: status = data.status;
	$: isClosed = status === 'closed';
	$: combinedPositionList = createCombinedPositionList(data.positions, data.state.stats);
</script>

<section style:overflow="auto">
	{#if combinedPositionList.length > 0}
		<PositionTable positions={combinedPositionList} {status} hasPagination={isClosed} hasSearch={isClosed} />
	{:else}
		<AlertList status="warning">
			<AlertItem>This strategy currently has no {status} positions.</AlertItem>
		</AlertList>
	{/if}
</section>
