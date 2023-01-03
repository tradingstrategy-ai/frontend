<!--
	Trading data splash page renderer
-->
<script lang="ts">
	import type { PageData } from './$types';
	import heroImage from '$lib/assets/illustrations/data-cloud-1.svg?raw';
	import ContentCardsTemplate from '$lib/components/ContentCardsTemplate.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>DEX trading view</title>
	<meta name="description" content="DEX trading view" />
</svelte:head>

<ContentCardsTemplate
	contentCardsSections={data.contentCardsSections}
	{heroImage}
	heroTitle="Trading data"
	heroSubtitle="Explore and download trading data from multiple blockchains and decentralised exchanges."
	pageTitle="DEX trading view"
	pageDescription="DEX trading view"
/>
