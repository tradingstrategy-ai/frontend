<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Alert } from '$lib/components';
	import PositionTable from './PositionTable.svelte';

	export let data;
	$: ({ positions, state, status } = data);

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
</script>

<section class="position-index">
	{#if positions.length > 0}
		{#if status === 'frozen'}
			<Alert status="error">
				The frozen positions could not be automatically open or closed, usually due to a problem with related tokens or
				blockchains. The profitability cannot be established for the same reason. Manual intervention may be needed.
			</Alert>
		{/if}

		<PositionTable
			{positions}
			{status}
			stats={state.stats}
			{...options}
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
