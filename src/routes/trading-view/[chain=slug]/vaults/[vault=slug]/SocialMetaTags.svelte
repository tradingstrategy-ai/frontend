<script lang="ts">
	import { page } from '$app/state';
	import type { Chain } from '$lib/helpers/chain';
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	interface Props {
		vault: VaultInfo;
		chain: Chain;
	}

	let { vault, chain }: Props = $props();

	let description = $derived(`Vault details for ${vault.name} vault on ${vault.protocol} on ${chain.name}`);
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let imageUrl = $derived(`https://vault-sparklines.tradingstrategy.ai/sparkline-90d-${vault.id}.svg`);
</script>

<MetaTags
	title={`{vault.name} | DeFi Vault | Trading Strategy`}
	{description}
	canonical={pageUrl}
	openGraph={{
		siteName: 'Trading Strategy',
		url: pageUrl,
		title: vault.name,
		description,
		images: [{ url: imageUrl }],
		type: 'website'
	}}
	twitter={{
		site: '@TradingProtocol',
		cardType: 'summary',
		title: vault.name,
		description
	}}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'NewsArticle',
		headline: vault.name,
		author: {
			'@type': 'Person',
			name: 'Trading Strategy'
		},
		datePublished: vault.start_date,
		dateModified: vault.last_updated_at
	}}
/>
