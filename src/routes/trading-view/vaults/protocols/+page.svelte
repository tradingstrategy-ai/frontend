<script lang="ts">
	import { resolve } from '$app/paths';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import Button from '$lib/components/Button.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';

	let { data } = $props();
	let { protocols } = $derived(data);
</script>

<svelte:head>
	<title>DeFi vault protocols | Trading Strategy</title>
	<meta name="description" content="Top DeFi stablecoin vault protocols across all blockchains" />
</svelte:head>

<Breadcrumbs labels={{ protocols: 'Protocols', vaults: 'Top Vaults' }} />

<main class="top-vaults ds-3">
	<Section tag="header">
		<HeroBanner subtitle="Top DeFi stablecoin vault protocols across all blockchains">
			{#snippet title()}
				<span>DeFi vault protocols</span>
				<DataBadge class="badge" status="warning">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<table class="datatable">
			<thead>
				<tr>
					<th>Name</th>
					<th>Risk</th>
					<th>Vaults</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each protocols as protocol (protocol.slug)}
					<tr>
						<td>{protocol.name}</td>
						<td>Low</td>
						<td>{protocol.vaultCount}</td>
						<td>
							<Button size="sm" href={resolve(`/trading-view/vaults/protocols/${protocol.slug}`)}>View details</Button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
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
</style>
