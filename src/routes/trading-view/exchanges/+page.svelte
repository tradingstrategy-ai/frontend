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

<main class="dexes">
	<Section layout="boxed">
		<HeroBanner
			title="Decentralised exchanges"
			subtitle="Browse supported decentralised exchanges across all blockchains"
		/>
	</Section>

	<Section layout="boxed" padding="sm">
		<ExchangesTable exchanges={data.exchanges} />
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
