<!--
@component
Search, Open Graph and Twitter metadata plus `InvestmentFund` and `BreadcrumbList`
structured data for a vault detail page.

@example

```svelte
	<SocialMetaTags {vault} {chain} {protocolMetadata} {curatorMetadata} {stablecoinMetadata} />
```
-->
<script lang="ts">
	import { page } from '$app/state';
	import type { Chain } from '$lib/helpers/chain';
	import {
		getBlockchainSocialLogoUrl,
		getCuratorSocialLogoUrl,
		getVaultSocialCardImageUrl,
		selectSocialCardImage
	} from '$lib/social-card/helpers';
	import { getStablecoinLogoUrl } from '$lib/stablecoin-metadata/helpers';
	import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
	import { getVaultCurrentTvlUsd, getVaultPeakTvlUsd, getVaultProtocolDisplayName } from '$lib/top-vaults/helpers';
	import { getGeneratedVaultDescription, getVaultTitleParts } from '$lib/top-vaults/vault-seo';
	import { getChainDisplayName } from '$lib/helpers/chain';
	import type { CuratorInfo, VaultInfo } from '$lib/top-vaults/schemas';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
	import type { VaultProtocolMetadata } from '$lib/vault-protocol/schemas';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	interface Props {
		vault: VaultInfo;
		chain: Chain;
		protocolMetadata?: VaultProtocolMetadata;
		curatorMetadata?: CuratorInfo | null;
		stablecoinMetadata?: StablecoinMetadata;
	}

	let { vault, chain, protocolMetadata, curatorMetadata, stablecoinMetadata }: Props = $props();
	// search wording: "<vault> <protocol> vault" (see .claude/plans/seo-round-4-vault-rankings.md)
	let titleParts = $derived(getVaultTitleParts(vault));
	let socialTitle = $derived(titleParts.join(' | '));

	// the vault's own description, verbatim, as for strategy pages (39ee8e1e)
	let description = $derived(vault.short_description ?? getGeneratedVaultDescription(vault));

	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let protocolLogoUrl = $derived.by(() => {
		const logoPath = protocolMetadata?.logos.light
			? getVaultProtocolLogoUrl(protocolMetadata.slug, { format: 'original' })
			: protocolMetadata?.logos.dark;
		return logoPath ? new URL(logoPath, page.url.origin).href : undefined;
	});
	let stablecoinLogoUrl = $derived.by(() => {
		const logoPath = stablecoinMetadata?.logos.light
			? getStablecoinLogoUrl(stablecoinMetadata.slug, { format: 'original' })
			: undefined;
		return logoPath ? new URL(logoPath, page.url.origin).href : undefined;
	});
	let fallbackImageUrl = $derived(
		selectSocialCardImage({
			curatorLogoUrl: getCuratorSocialLogoUrl(curatorMetadata),
			protocolLogoUrl,
			blockchainLogoUrl: getBlockchainSocialLogoUrl(chain.slug),
			stablecoinLogoUrl
		})
	);
	let imageUrl = $derived(getVaultSocialCardImageUrl(vault, fallbackImageUrl));

	let additionalProperty = $derived.by(() => {
		const props: Array<Record<string, unknown>> = [];

		// NAV is in denomination units; only a USD figure may be labelled USD
		const tvlUsd = getVaultCurrentTvlUsd(vault);
		if (tvlUsd != null) {
			props.push({ '@type': 'PropertyValue', name: 'totalValueLocked', value: tvlUsd, unitText: 'USD' });
		}
		const peakTvlUsd = getVaultPeakTvlUsd(vault);
		if (peakTvlUsd != null) {
			props.push({ '@type': 'PropertyValue', name: 'peakTVL', value: peakTvlUsd, unitText: 'USD' });
		}
		if (vault.risk) {
			props.push({ '@type': 'PropertyValue', name: 'riskLevel', value: vault.risk });
		}
		if (vault.risk_numeric != null) {
			props.push({ '@type': 'PropertyValue', name: 'riskScore', value: vault.risk_numeric });
		}
		props.push({ '@type': 'PropertyValue', name: 'blockchain', value: getChainDisplayName(vault.chain_id) });
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
			name: getVaultProtocolDisplayName(vault)
		};
		if (protocolMetadata?.links.homepage) {
			org.url = protocolMetadata.links.homepage;
		}
		if (protocolLogoUrl) {
			org.logo = protocolLogoUrl;
		}
		return org;
	});
</script>

<MetaTags
	{titleParts}
	{description}
	image={imageUrl}
	imageAlt={`${vault.name} preview image`}
	openGraph={{ url: pageUrl, title: socialTitle }}
	twitter={{ cardType: 'summary_large_image', title: socialTitle }}
/>

<!-- vault pages render no visible breadcrumb trail, so the list is declared as JSON-LD -->
<JsonLd
	schema={{
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'DeFi vaults', item: new URL('/vaults', page.url.origin).href },
			{
				'@type': 'ListItem',
				position: 2,
				name: `${getChainDisplayName(vault.chain_id)} vaults`,
				item: new URL(`/vaults/chains/${chain.slug}`, page.url.origin).href
			},
			{ '@type': 'ListItem', position: 3, name: vault.name, item: pageUrl }
		]
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
