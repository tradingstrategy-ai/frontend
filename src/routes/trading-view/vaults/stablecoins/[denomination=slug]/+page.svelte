<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas';
	import { page } from '$app/state';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { denominationSlug, denominationName } = $derived(data);

	let topVaults = $state<TopVaults>();
	let loading = $state(true);

	async function loadVaults() {
		try {
			const resp = await fetch('/top-vaults/all-data');
			if (!resp.ok) throw new Error(`Failed to fetch vault data: ${resp.status}`);
			const allData: TopVaults = await resp.json();
			topVaults = {
				...allData,
				vaults: allData.vaults.filter((v) => v.denomination_slug === denominationSlug)
			};
		} catch (e) {
			console.error('Failed to load vault data:', e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadVaults();
	});

	let title = $derived(`${denominationName} top vaults | Trading Strategy`);
	let description = $derived(`Top ${denominationName} DeFi vaults ranked by performance.`);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<TopVaultsPage
	{topVaults}
	{loading}
	title="Top {denominationName} vaults"
	subtitle="The best performing {denominationName} DeFi vaults"
	showFilters
	defaultTvlKey="10k"
/>
