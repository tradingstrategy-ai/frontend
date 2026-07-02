<!--
International vault listing for non-USD-denominated vaults.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
	import { buildStablecoinMetadataLookup, findStablecoinMetadata } from '$lib/stablecoin-metadata/helpers';
	import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
	import { fetchAllVaultData, hasVaultCache } from '$lib/top-vaults/client-cache';
	import {
		type CurrencyUsdRate,
		getCurrencyUsdRates,
		getVaultCurrentTvlUsd,
		getVaultDenominationCurrency,
		isNonUsdDenominatedVault,
		withVaultDenominationTokenRate
	} from '$lib/top-vaults/helpers';
	import type { TopVaults, VaultInfo } from '$lib/top-vaults/schemas';
	import { formatDollar } from '$lib/helpers/formatters';

	let topVaults = $state<TopVaults>();
	let loading = $state(!hasVaultCache());

	function formatCurrencyList(currencies: string[]): string {
		if (currencies.length === 0) return 'unknown currencies';
		if (currencies.length === 1) return currencies[0];
		if (currencies.length === 2) return `${currencies[0]} and ${currencies[1]}`;

		return `${currencies.slice(0, -1).join(', ')}, and ${currencies[currencies.length - 1]}`;
	}

	function getVaultMetadata(vault: VaultInfo, lookup: Map<string, StablecoinMetadata>): StablecoinMetadata | undefined {
		return findStablecoinMetadata(lookup, vault.denomination_slug, vault.denomination, vault.normalised_denomination);
	}

	function toInternationalVault(
		vault: VaultInfo,
		lookup: Map<string, StablecoinMetadata>,
		currencyUsdRates: Map<string, CurrencyUsdRate>
	): VaultInfo | null {
		const metadata = getVaultMetadata(vault, lookup);
		const enrichedVault = withVaultDenominationTokenRate(vault, metadata, currencyUsdRates);

		return isNonUsdDenominatedVault(enrichedVault) && getVaultCurrentTvlUsd(enrichedVault) != null
			? enrichedVault
			: null;
	}

	$effect(() => {
		Promise.all([fetchAllVaultData(), fetchStablecoinMetadataIndex(fetch)])
			.then(([allData, metadataIndex]) => {
				const lookup = buildStablecoinMetadataLookup(metadataIndex);
				const currencyUsdRates = getCurrencyUsdRates(metadataIndex);
				const internationalVaults = allData.vaults
					.map((vault) => toInternationalVault(vault, lookup, currencyUsdRates))
					.filter((vault): vault is VaultInfo => vault != null && isNonUsdDenominatedVault(vault));

				topVaults = {
					...allData,
					vaults: internationalVaults
				};
			})
			.catch((e) => console.error('Failed to load vault data:', e))
			.finally(() => (loading = false));
	});

	const title = 'International DeFi vaults';
	const description =
		'Non-USD-denominated DeFi vaults, with TVL converted to USD using the latest denomination token exchange rates.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let pageSubtitle = $derived.by(() => {
		if (!topVaults) return 'Loading non-USD vault TVL and currencies.';

		const vaults = topVaults.vaults;
		const totalTvlUsd = vaults.reduce((sum, vault) => sum + (getVaultCurrentTvlUsd(vault) ?? 0), 0);
		const currencies = [
			...new Set(
				vaults
					.map((vault) => getVaultDenominationCurrency(vault)?.toUpperCase())
					.filter((currency): currency is string => Boolean(currency))
			)
		].toSorted((a, b) => a.localeCompare(b));

		return `Total ${vaults.length} non-USD vaults with ${formatDollar(totalTvlUsd, 0)} USD TVL with currencies of ${formatCurrencyList(currencies)}.`;
	});
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: title,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: topVaults?.vaults.length ?? 0
		}
	}}
/>

<TopVaultsPage
	{topVaults}
	{loading}
	title="International stablecoin vaults"
	subtitle={pageSubtitle}
	showFilters
	defaultTvlKey="10k"
	defaultHideUnknown={0}
/>
