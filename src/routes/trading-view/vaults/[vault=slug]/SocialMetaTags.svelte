<script lang="ts">
	import { page } from '$app/state';
	import { vaultSparklinesUrl } from '$lib/config';
	import type { Chain } from '$lib/helpers/chain';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	interface Props {
		vault: VaultInfo;
		chain: Chain;
	}

	let { vault, chain }: Props = $props();

	let generatedDescription = $derived.by(() => {
		const parts = [`${vault.name} on ${vault.protocol} on ${chain.name}`];
		if (vault.current_nav != null) {
			parts.push(`TVL: ${formatDollar(vault.current_nav, 0)}`);
		}
		if (vault.one_month_returns != null) {
			parts.push(`1M return: ${formatPercent(vault.one_month_returns)}`);
		}
		return parts.join(' | ');
	});

	let description = $derived(vault.short_description ?? generatedDescription);

	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let imageUrl = $derived(`${vaultSparklinesUrl}/sparkline-90d-${vault.id}.png`);
</script>

<MetaTags
	title={`${vault.name} | DeFi Vault | Trading Strategy`}
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
		description,
		image: imageUrl
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
