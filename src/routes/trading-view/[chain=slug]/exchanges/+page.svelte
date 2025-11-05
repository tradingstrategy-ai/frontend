<!--
	Render listing of all exchanges for particular chain
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ExchangeTable, { sortOptions } from '$lib/explorer/ExchangeTable.svelte';
	import { HeroBanner, Section } from '$lib/components';
	import { getStringParam, getNumberParam } from '$lib/helpers/url-params.js';

	let { data } = $props();
	let { chain, exchanges } = $derived(data);

	let { searchParams } = $derived(page.url);

	let options = $derived({
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	});

	const onChange: ComponentProps<typeof ExchangeTable>['onChange'] = async (params, scrollToTop) => {
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};
</script>

<svelte:head>
	<title>{chain.name} Exchanges | Trading Strategy</title>
	<meta name="description" content="Top decentralised exchanges on {chain.name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.slug]: chain.name }} />

<main class="chain-exchanges-page">
	<Section tag="header">
		<HeroBanner title="{chain.name} DEXes">
			{#snippet subtitle()}
				Browse {exchanges.length} decentralised exchanges on
				<a class="body-link" href=".">{chain.name} blockchain</a>.
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<ExchangeTable rows={exchanges} {...options} hideChainIcon {onChange} />
	</Section>
</main>
