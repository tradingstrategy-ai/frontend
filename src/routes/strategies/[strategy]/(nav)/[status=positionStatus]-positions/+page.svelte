<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { createCombinedPositionList } from 'trade-executor-frontend/state/stats';
	import { Alert } from '$lib/components';
	import PositionTable from './PositionTable.svelte';

	export let data;

	$: status = data.status;
	$: combinedPositionList = createCombinedPositionList(data.positions, data.state.stats);

	$: q = $page.url.searchParams;
	$: options = {
		page: Number(q.get('page')) || 0,
		sort: q.get('sort') || 'position_id',
		direction: q.get('direction') || 'desc'
	};

	async function handleChange({ detail }: ComponentEvents<PositionTable>['change']) {
		// skip URL updates when user navigates to different positions status page
		if (!$page.url.pathname.includes(status)) return;
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		detail.scrollToTop();
	}

	const statusColumns = {
		open: ['flags', 'profitability', 'value', 'opened_at', 'details_cta'],
		closed: ['flags', 'profitability', 'value_at_open', 'closed_at', 'details_cta'],
		frozen: ['flags', 'frozen_status', 'frozen_value', 'frozen_at', 'details_cta']
	};
</script>

<section class="position-index">
	{#if combinedPositionList.length > 0}
		{#if status === 'frozen'}
			<Alert status="error">
				The frozen positions could not be automatically open or closed, usually due to a problem with related tokens or
				blockchains. The profitability cannot be established for the same reason. Manual intervention may be needed.
			</Alert>
		{/if}

		<PositionTable
			positions={combinedPositionList}
			{status}
			{...options}
			columns={statusColumns[status]}
			hasPagination={status === 'closed'}
			hasSearch={status === 'closed'}
			on:change={handleChange}
		/>
	{:else}
		<Alert status="info">
			This strategy currently has no {status} positions.
		</Alert>
	{/if}
</section>

<style lang="postcss">
	.position-index {
		display: grid;
		gap: 1.5rem;
		align-content: start;
	}
</style>
