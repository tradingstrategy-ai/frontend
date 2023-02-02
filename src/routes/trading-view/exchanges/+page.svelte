<!--
	Render listing of all available exchanges
-->
<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ExchangesTable from '$lib/explorer/ExchangesTable.svelte';
	import { HeroBanner, Section } from '$lib/components';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Decentralised exchanges</title>
	<meta name="description" content="Top decentralised exchanges" />
</svelte:head>

<Breadcrumbs />

<main>
	<Section layout="boxed">
		<HeroBanner
			title="Decentralised exchanges"
			subtitle="Browse supported decentralised exchanges across all blockchains"
		/>
	</Section>

	<Section layout="boxed" padding="sm">
		<ExchangesTable exchanges={data.exchanges.slice(0, 10)} />
	</Section>
</main>
