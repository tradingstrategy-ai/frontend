<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { TopVaults } from './schemas';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsTable from './TopVaultsTable.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';

	interface Props {
		chain?: Chain;
		topVaults: TopVaults;
		breadcrumbs?: Record<string, string>;
		title: string;
		subtitle: string;
	}

	let { chain, topVaults, breadcrumbs, title: pageTitle, subtitle }: Props = $props();
</script>

<Breadcrumbs labels={{ vaults: 'Top vaults', ...breadcrumbs }} />

<main class="chain-vaults ds-3">
	<Section tag="header">
		<HeroBanner {subtitle}>
			{#snippet title()}
				<span>
					{#if chain}
						<img src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
					{/if}
					<span>{pageTitle}</span>
					<DataBadge class="badge" status="warning">Beta</DataBadge>
				</span>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<TopVaultsTable {topVaults} {chain} />
	</Section>
</main>

<style>
	.chain-vaults {
		span {
			display: inline-flex;
			flex-wrap: wrap;
			gap: 0.25em;
			align-items: center;
		}

		img {
			height: 1em;
		}

		:global(.badge) {
			font-size: 0.5em;
		}
	}
</style>
