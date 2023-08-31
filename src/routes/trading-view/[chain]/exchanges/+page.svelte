<!--
	Render listing of all exchanges for particular chain
-->
<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ExchangeTable from '$lib/explorer/ExchangeTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	export let data;
	$: ({ chain, exchanges } = data);

	$: q = $page.url.searchParams;
	$: options = {
		page: Number(q.get('page')) || 0,
		sort: q.get('sort') || 'volume_30d',
		direction: q.get('direction') || 'desc'
	};

	async function handleChange({ detail }: ComponentEvents<ExchangeTable>['change']) {
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>{chain.chain_name} Exchanges | Trading Strategy</title>
	<meta name="description" content="Top decentralised exchanges on {chain.chain_name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name }} />

<main class="chain-exchanges-page">
	<Section tag="header">
		<HeroBanner contentFullWidth title="{chain.chain_name} DEXes">
			<svelte:fragment slot="subtitle">
				Browse {exchanges.length} decentralised exchanges on
				<a class="body-link" href=".">{chain.chain_name} blockchain</a>.
			</svelte:fragment>
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<ExchangeTable rows={exchanges} {...options} hiddenColumns={['chain_name']} on:change={handleChange} />
	</Section>
</main>
