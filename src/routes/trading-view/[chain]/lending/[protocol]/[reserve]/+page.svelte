<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Section, PageHeader } from '$lib/components';
	import { ReserveInterestChart } from '$lib/chart';
	import InfoTable from './InfoTable.svelte';

	export let data;
	$: ({ reserve } = data);

	$: breadcrumbs = {
		[reserve.chain_slug]: reserve.chain_name,
		lending: 'Lending',
		[reserve.protocol_slug]: reserve.protocol_name,
		[reserve.reserve_slug]: reserve.asset_symbol
	};
</script>

<svelte:head>
	<title>{reserve.asset_symbol} {reserve.protocol_name} reserve on {reserve.chain_name}</title>
	<meta
		name="description"
		content="{reserve.asset_name} lending reserve on {reserve.protocol_name} protocol on {reserve.chain_name}"
	/>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main>
	<PageHeader title={reserve.asset_name} subtitle="{reserve.protocol_name} reserve on {reserve.chain_name}" />

	<section class="ds-container info" data-testid="reserve-info">
		<div class="ds-2-col">
			<InfoTable {reserve} />
			<div />
		</div>
	</section>
</main>

<Section padding="md">
	<h3>Interest rates</h3>
	<ReserveInterestChart {reserve} timeBucket="1d" rateType="variable_borrow_apr" />
</Section>

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
