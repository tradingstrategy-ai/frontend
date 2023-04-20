<!--
	Render listing of all available exchanges
-->
<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ExchangesTable from '$lib/explorer/ExchangesTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	export let data;

	$: q = $page.url.searchParams;
	$: options = {
		page: Number(q.get('page')) || 0,
		sort: q.get('sort') || 'volume_30d',
		direction: q.get('direction') || 'desc'
	};

	async function handleChange({ detail }: ComponentEvents<ExchangesTable>['change']) {
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>Decentralised exchanges</title>
	<meta name="description" content="Top decentralised exchanges" />
</svelte:head>

<Breadcrumbs />

<main class="exchange-index-page">
	<Section tag="header">
		<HeroBanner
			title="Decentralised exchanges"
			subtitle="Browse supported decentralised exchanges across all blockchains"
		/>
	</Section>

	<Section padding="sm">
		<ExchangesTable rows={data.exchanges} {...options} on:change={handleChange} />
	</Section>
</main>
