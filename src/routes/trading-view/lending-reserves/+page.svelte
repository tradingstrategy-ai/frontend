<!--
	Render listing of all available Reserves
-->
<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import LendingReserveTable from '$lib/explorer/LendingReserveTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	export let data;
	$: ({ reserves, options } = data);

	let loading = false;

	async function handleChange({ detail }: ComponentEvents<LendingReserveTable>['change']) {
		loading = true;
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		loading = false;
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>Lending Reserves</title>
	<meta name="description" content="Top decentralised lending reserves" />
</svelte:head>

<Breadcrumbs labels={{ 'lending-reserves': 'All lending reserves' }} />

<main class="reserves-index-page">
	<Section tag="header">
		<HeroBanner
			title="Lending reserves"
			subtitle="Browse lending reserves across supported chains and protocols below"
		/>
	</Section>

	<Section padding="sm">
		<LendingReserveTable {...reserves} {...options} {loading} on:change={handleChange} />
	</Section>
</main>
