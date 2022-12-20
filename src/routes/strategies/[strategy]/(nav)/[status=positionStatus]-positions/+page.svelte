<script lang="ts">
	import type { PageData } from './$types';
	import { createCombinedPositionList } from 'trade-executor-frontend/state/stats';
	import { AlertList, AlertItem } from '$lib/components';
	import PositionTable from './PositionTable.svelte';

	export let data: PageData;

	$: status = data.status;
	$: combinedPositionList = createCombinedPositionList(data.positions, data.state.stats);
	$: isClosed = status === 'closed';

	const statusColumns = {
		open: ['profitability', 'value', 'opened_at', 'details_cta'],
		closed: ['profitability', 'value_at_open', 'closed_at', 'details_cta'],
		frozen: ['frozen_on', 'frozen_value', 'frozen_at', 'details_cta']
	};
</script>

<section class="position-index">
	{#if combinedPositionList.length > 0}
		{#if status === 'frozen'}
			<AlertList status="error">
				<AlertItem>
					The frozen positions could not be automatically open or closed, usually due to a problem with related tokens
					or blockchains. The profitabitility cannot be established for the same reason. Manual intervention maybe
					needed.
				</AlertItem>
			</AlertList>
		{/if}

		<PositionTable
			positions={combinedPositionList}
			{status}
			columns={statusColumns[status]}
			hasPagination={isClosed}
			hasSearch={isClosed}
		/>
	{:else}
		<AlertList status="success">
			<AlertItem>This strategy currently has no {status} positions.</AlertItem>
		</AlertList>
	{/if}
</section>

<style lang="postcss">
	.position-index {
		display: grid;
		gap: 1.5rem;
		align-items: start;
		overflow: auto;
	}
</style>
