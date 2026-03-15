<script lang="ts">
	import { page } from '$app/state';
	import type { Chain } from '$lib/helpers/chain';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { getVaultSparklineUrl } from '$lib/top-vaults/helpers';
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';

	interface Props {
		vault: VaultInfo;
		chain: Chain;
		protocolMetadata?: VaultProtocolMetadata;
	}

	let { vault, chain, protocolMetadata }: Props = $props();

	let generatedDescription = $derived.by(() => {
		const parts = [`${vault.name} on ${vault.protocol} on ${chain.name}`];
		if (vault.current_nav != null) {
			parts.push(`TVL: ${formatDollar(vault.current_nav, 0)}`);
		}
		if (vault.one_month_returns != null) {
			parts.push(`1M return: ${formatPercent(vault.one_month_returns)}`);
		}
		if (vault.risk) {
			parts.push(`Risk: ${vault.risk}`);
		}
		return parts.join(' | ');
	});

	let description = $derived(vault.short_description ?? generatedDescription);

	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let imageUrl = $derived(getVaultSparklineUrl(vault, 'png') ?? '');

	let additionalProperty = $derived.by(() => {
		const props: Array<Record<string, unknown>> = [];

		if (vault.current_nav != null) {
			props.push({ '@type': 'PropertyValue', name: 'totalValueLocked', value: vault.current_nav, unitText: 'USD' });
		}
		if (vault.peak_nav != null) {
			props.push({ '@type': 'PropertyValue', name: 'peakTVL', value: vault.peak_nav, unitText: 'USD' });
		}
		if (vault.risk) {
			props.push({ '@type': 'PropertyValue', name: 'riskLevel', value: vault.risk });
		}
		if (vault.risk_numeric != null) {
			props.push({ '@type': 'PropertyValue', name: 'riskScore', value: vault.risk_numeric });
		}
		props.push({ '@type': 'PropertyValue', name: 'blockchain', value: chain.name });
		if (vault.denomination) {
			props.push({ '@type': 'PropertyValue', name: 'denomination', value: vault.denomination });
		}
		if (vault.three_months_sharpe_net != null) {
			props.push({ '@type': 'PropertyValue', name: 'sharpeRatio', value: vault.three_months_sharpe_net });
		}
		if (vault.three_months_volatility != null) {
			props.push({
				'@type': 'PropertyValue',
				name: 'volatility',
				value: vault.three_months_volatility,
				unitText: '%'
			});
		}
		if (vault.one_month_returns_net != null) {
			props.push({
				'@type': 'PropertyValue',
				name: 'oneMonthReturn',
				value: vault.one_month_returns_net,
				unitText: '%'
			});
		}
		if (vault.three_months_returns_net != null) {
			props.push({
				'@type': 'PropertyValue',
				name: 'threeMonthReturn',
				value: vault.three_months_returns_net,
				unitText: '%'
			});
		}
		if (vault.lifetime_return_net != null) {
			props.push({
				'@type': 'PropertyValue',
				name: 'lifetimeReturn',
				value: vault.lifetime_return_net,
				unitText: '%'
			});
		}

		return props;
	});

	let provider = $derived.by(() => {
		const org: Record<string, unknown> = {
			'@type': 'Organization',
			name: vault.protocol
		};
		if (protocolMetadata?.links.homepage) {
			org.url = protocolMetadata.links.homepage;
		}
		if (protocolMetadata?.logos.light) {
			org.logo = protocolMetadata.logos.light;
		}
		return org;
	});
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
		cardType: 'summary_large_image',
		title: vault.name,
		description,
		image: imageUrl
	}}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'InvestmentFund',
		name: vault.name,
		description,
		url: pageUrl,
		image: imageUrl,
		provider,
		dateCreated: vault.start_date,
		dateModified: vault.last_updated_at,
		interestRate: vault.one_month_cagr_net ?? vault.one_month_cagr ?? undefined,
		feesAndCommissionsSpecification: vault.fee_label ?? undefined,
		additionalProperty
	}}
/>
