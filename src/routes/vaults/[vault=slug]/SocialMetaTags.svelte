<script lang="ts">
	import { page } from '$app/state';
	import type { Chain } from '$lib/helpers/chain';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import {
		getBlockchainSocialLogoUrl,
		getCuratorSocialLogoUrl,
		getVaultSocialCardImageUrl,
		selectSocialCardImage
	} from '$lib/social-card/helpers';
	import { getStablecoinLogoUrl } from '$lib/stablecoin-metadata/helpers';
	import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
	import { getVaultAssetType, getVaultProtocolDisplayName } from '$lib/top-vaults/helpers';
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
	let assetType = $derived(getVaultAssetType(vault));
	let socialTitle = $derived(`${vault.name} | DeFi ${assetType} | Trading Strategy`);

	let generatedDescription = $derived.by(() => {
		const parts = [`${vault.name} on ${getVaultProtocolDisplayName(vault)} on ${getChainDisplayName(vault.chain_id)}`];
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
	title={socialTitle}
	{description}
	canonical={pageUrl}
	image={imageUrl}
	imageAlt={`${vault.name} preview image`}
	openGraph={{
		siteName: 'Trading Strategy',
		url: pageUrl,
		title: socialTitle,
		description,
		type: 'website'
	}}
	twitter={{
		site: '@TradingProtocol',
		cardType: 'summary_large_image',
		title: socialTitle,
		description
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
