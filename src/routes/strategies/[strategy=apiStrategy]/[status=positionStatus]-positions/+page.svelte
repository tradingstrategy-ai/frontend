<script lang="ts">
	import type { ComponentEvents, ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Alert } from '$lib/components';
	import {
		getExchangeAccountInfo,
		getExchangeAccountUrl,
		getExchangeDisplayName
	} from 'trade-executor/helpers/exchange-account';
	import PositionTable from './PositionTable.svelte';
	import { capitalize } from '$lib/helpers/formatters';

	let { data } = $props();
	let { admin, positions, status, strategy, reserves } = $derived(data);

	let exchangeAccount = $derived.by(() => {
		// Try tag-based detection first
		const fromTags = getExchangeAccountInfo(strategy);
		if (fromTags) return fromTags;

		// Fall back to detecting from position data
		const exchangePosition = positions.find((p) => p.pair.kind === 'exchange_account');
		const protocol = exchangePosition?.pair.other_data?.exchange_protocol as string | undefined;
		if (!protocol) return undefined;

		const address =
			strategy.on_chain_data.asset_management_mode === 'lagoon'
				? strategy.on_chain_data.smart_contracts.safe
				: undefined;
		if (!address) return undefined;

		const url = getExchangeAccountUrl(protocol, address);
		if (!url) return undefined;
		return { url, name: getExchangeDisplayName(protocol), protocol };
	});

	type Options = Pick<ComponentProps<typeof PositionTable>, 'page' | 'sort' | 'direction'>;

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

	const onChange: ComponentProps<typeof PositionTable>['onChange'] = async (params, scrollToTop) => {
		// skip URL updates when user navigates to different positions status page
		if (!page.url.pathname.includes(status)) return;
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};
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
			{exchangeAccount}
			{reserves}
			{onChange}
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
