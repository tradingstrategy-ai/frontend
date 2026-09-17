<!--
	Render listing of all available exchanges
-->
<script lang="ts">
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ExchangeTable, { sortOptions } from '$lib/explorer/ExchangeTable.svelte';
	import { HeroBanner, Section } from '$lib/components';
	import { getStringParam, getNumberParam } from '$lib/helpers/url-params.js';

	let { data } = $props();

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

<MetaTags
	titleParts={['Decentralised exchanges']}
	description="Top decentralised exchanges ranked by trading volume, with their pairs, tokens and historical market data."
/>

<Breadcrumbs />

<main class="exchange-index-page">
	<Section tag="header">
		<HeroBanner
			title="Decentralised exchanges"
			subtitle="Browse supported decentralised exchanges across all blockchains"
		/>
	</Section>

	<Section padding="sm">
		<ExchangeTable rows={data.exchanges} {...options} {onChange} />
	</Section>
</main>
