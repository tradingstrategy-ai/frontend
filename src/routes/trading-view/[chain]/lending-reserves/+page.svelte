<!--
	Render listing of all available Reserves for specific chain
-->
<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import LendingReserveTable from '$lib/explorer/LendingReserveTable.svelte';
	import { HeroBanner, Section } from '$lib/components';
	import { formatAmount } from '$lib/helpers/formatters.js';

	export let data;
	$: ({ chain, reserves, options } = data);

	let loading = false;

	async function handleChange({ detail }: ComponentEvents<LendingReserveTable>['change']) {
		loading = true;
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		loading = false;
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>{chain.chain_name} Lending Reserves</title>
	<meta name="description" content="Top lending reserves on {chain.chain_name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name, 'lending-reserves': 'Lending reserves' }} />

<main class="reserves-index-page">
	<Section tag="header">
		<HeroBanner contentFullWidth title="{chain.chain_name} lending reserves">
			<svelte:fragment slot="subtitle">
				Browse {formatAmount(reserves?.totalRowCount)} lending reserves on
				<a class="body-link" href=".">{chain.chain_name} blockchain</a>.
			</svelte:fragment>
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<LendingReserveTable {...reserves} {...options} {loading} hiddenColumns={['chain_name']} on:change={handleChange} />
	</Section>
</main>
