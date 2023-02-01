<!--
	Render listing of all available exchanges
-->
<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ExchangesTable from '$lib/explorer/ExchangesTable.svelte';
	import { PageHeader, Section } from '$lib/components';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Decentralised exchanges</title>
	<meta name="description" content="Top decentralised exchanges" />
</svelte:head>

<Breadcrumbs />

<main>
	<PageHeader
		title="Decentralised exchanges"
		description="Browse supported decentralised exchanges across all blockchains"
	/>

	<Section layout="boxed" padding="md">
		<ExchangesTable exchanges={data.exchanges} />
	</Section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-md);
	}
</style>
