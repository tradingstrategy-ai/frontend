<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Section, PageHeader } from '$lib/components';
	import InfoTable from './InfoTable.svelte';
	import { getProtocolName } from '$lib/helpers/lending';

	export let data;
	$: ({ chain, reserve } = data);

	$: protocolName = getProtocolName(reserve.protocol_slug);

	$: breadcrumbs = {
		[chain.chain_slug]: chain.chain_name,
		lending: 'Lending',
		[reserve.protocol_slug]: protocolName,
		[reserve.reserve_slug]: reserve.asset_symbol
	};
</script>

<svelte:head>
	<title>{reserve.asset_symbol} {protocolName} reserve on {chain.chain_name}</title>
	<meta
		name="description"
		content="{reserve.asset_name} lending reserve on {protocolName} protocol on {chain.chain_name}"
	/>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main>
	<PageHeader title={reserve.asset_name} subtitle="{protocolName} reserve on {chain.chain_name}" />

	<section class="ds-container info" data-testid="reserve-info">
		<div class="ds-2-col">
			<InfoTable {protocolName} {chain} {reserve} />
			<div />
		</div>
	</section>
</main>

<Section padding="md">
	<h3>Reserve details API payload</h3>
	<pre>{JSON.stringify(reserve, null, 4)}</pre>
</Section>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-3xl);

		@media (--viewport-lg-up) {
			gap: 5rem;
		}
	}

	h3 {
		font: var(--f-heading-md-medium);
	}

	pre {
		padding: var(--space-lg);
		background: var(--c-background-7);
		border-radius: var(--radius-md);
		color: var(--c-text-default-night);
		font: var(--f-mono-md-regular);
		letter-spacing: var(--f-mono-md-spacing, normal);
	}
</style>
