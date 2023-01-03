<script lang="ts">
	import type { PageData } from './$types';
	import ContentCardsTemplate from '$lib/components/ContentCardsTemplate.svelte';
	import heroImage from '$lib/assets/illustrations/communication-1.svg?raw';

	export let data: PageData;
</script>

<ContentCardsTemplate
	cols={3}
	contentCardsSections={data.contentCardsSections}
	{heroImage}
	heroTitle="Community"
	heroSubtitle="Join our community of expert traders, strategy developers and quants.<br /> Learn more about the Trading Strategy protocol, algorithmic trading and DeFi markets."
	pageTitle="Community"
	pageDescription="Blog, Discord and discussion"
/>
