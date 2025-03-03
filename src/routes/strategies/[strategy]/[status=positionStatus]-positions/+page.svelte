<script lang="ts">
	import type { ComponentEvents, ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Alert } from '$lib/components';
	import PositionTable from './PositionTable.svelte';
	import { capitalize } from '$lib/helpers/formatters';

	let { data } = $props();
	let { admin, positions, status, strategy, reserves } = $derived(data);

	type Options = Pick<ComponentProps<PositionTable>, 'page' | 'sort' | 'direction'>;

	const defaultSort = {
		open: 'profit',
		closed: 'closed_at',
		frozen: 'frozen_at'
	} as const;

	let q = $derived(page.url.searchParams);
	let options: Options = $derived({
		page: Number(q.get('page')) || 0,
		sort: q.get('sort') || defaultSort[status],
		direction: q.get('direction') === 'asc' ? 'asc' : 'desc'
	});

	async function handleChange({ detail }: ComponentEvents<PositionTable>['change']) {
		// skip URL updates when user navigates to different positions status page
		if (!page.url.pathname.includes(status)) return;
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>{capitalize(status)} positions | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="List of all {status} positions for {strategy.name} strategy" />
</svelte:head>

<section class="position-index">
	{#if positions.length > 0 || status === 'open'}
		{#if status === 'frozen'}
			<Alert status="error">
				The frozen positions could not be automatically open or closed, usually due to a problem with related tokens or
				blockchains. The profitability cannot be established for the same reason. Manual intervention may be needed.
			</Alert>
		{/if}

		<PositionTable
			{admin}
			{positions}
			{status}
			{...options}
			hasPagination={positions.length > 5}
			hasSearch={positions.length > 5}
			hiddenPositions={strategy.hiddenPositions}
			{reserves}
			on:change={handleChange}
		/>
	{:else}
		<Alert status="info">
			This strategy currently has no {status} positions.
		</Alert>
	{/if}
</section>

<style>
	.position-index {
		display: grid;
		gap: 1.5rem;
		align-content: start;
	}
</style>
