<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import VaultGroupTable from '$lib/top-vaults/VaultGroupTable.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';

	let { data } = $props();
	let { protocols, options } = $derived(data);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};
</script>

<svelte:head>
	<title>DeFi stablecoin vault protocols | Trading Strategy</title>
	<meta name="description" content="Top DeFi stablecoin vault protocols across all blockchains" />
</svelte:head>

<Breadcrumbs labels={{ vaults: 'Top Vaults', protocols: 'Protocols' }} />

<main class="protocol-index-page">
	<Section tag="header">
		<HeroBanner subtitle="Browse supported DeFi stablecoin vault protocols across all blockchains">
			{#snippet title()}
				<span>DeFi stablecoin vault protocols</span>
				<DataBadge class="badge" status="warning">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<VaultListingsSelector boxed />

	<Section padding="sm">
		<VaultGroupTable groupLabel="Protocol" includeRisk rows={protocols} {...options} {onChange} />
	</Section>
</main>

<style>
	.protocol-index-page {
		:global(.badge) {
			font-size: 0.5em;
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}
	}
</style>
