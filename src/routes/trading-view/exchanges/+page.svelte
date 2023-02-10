<!--
	Render listing of all available exchanges
-->
<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { goto, afterNavigate, disableScrollHandling } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ExchangesTable from '$lib/explorer/ExchangesTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	export let data: PageData;

	$: q = $page.url.searchParams;
	$: options = {
		page: Number(q.get('page')) || 0,
		sort: q.get('sort') || 'volume_30d',
		direction: q.get('direction') || 'desc'
	};

	function handleChange({ detail }) {
		goto('?' + new URLSearchParams(detail));
	}

	afterNavigate(disableScrollHandling);
</script>

<svelte:head>
	<title>Decentralised exchanges</title>
	<meta name="description" content="Top decentralised exchanges" />
</svelte:head>

<Breadcrumbs />

<main class="dexes">
	<Section layout="boxed">
		<HeroBanner
			title="Decentralised exchanges"
			subtitle="Browse supported decentralised exchanges across all blockchains"
		/>
	</Section>

	<Section layout="boxed" padding="sm">
		<ExchangesTable rows={data.exchanges} {...options} on:change={handleChange} />
	</Section>
</main>

<style lang="postcss">
	@media (--viewport-md) {
		.dexes :global table .right {
			text-align: right;
		}

		.dexes :global table .cta {
			max-width: 8rem;
			padding-left: 1rem;
		}
	}
</style>
