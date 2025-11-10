<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsTable from '$lib/top-vaults/TopVaultsTable.svelte';

	const { data } = $props();
	const { topVaults } = data;
</script>

<svelte:head>
	<title>Top DeFi stablecoin vaults</title>
	<meta name="description" content="The best DeFi vaults for all blockchains." />
</svelte:head>

<Breadcrumbs labels={{ vaults: 'Top Vaults' }} />

<main class="top-vaults ds-3">
	<Section tag="header">
		<HeroBanner subtitle="The best performing DeFi stablecoin vaults across multiple blockchains">
			{#snippet title()}
				<span>Top DeFi stablecoin vaults</span>
				<DataBadge class="badge" status="warning">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<TopVaultsTable {topVaults} />
	</Section>

	<Section>
		<div class="api-link">
			<a class="body-link" href="https://tradingstrategy.ai/blog/announcing-defi-vault-top-lists-and-api">
				Available as API here.
			</a>
		</div>
	</Section>
</main>

<style>
	.top-vaults {
		:global(.badge) {
			font-size: 0.5em;
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}
	}

	.api-link {
		margin-top: 2rem;
		font: var(--f-ui-body-medium);
		color: var(--c-text-light);
		text-align: center;

		@media (--viewport-md-down) {
			font: var(--f-ui-small-medium);
		}
	}
</style>
