<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import Section from '$lib/components/Section.svelte';
	import { formatSwapFee } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	let { data } = $props();
	let { summary } = $derived(data);

	let swapFee = $derived(formatSwapFee(summary.pair_swap_fee));

	let breadcrumbs = $derived({
		[summary.chain_slug]: summary.chain_name,
		[summary.exchange_slug]: summary.exchange_name,
		[summary.pair_slug]: summary.pair_name,
		'tv-chart': 'TradingView Chart'
	});
</script>

<svelte:head>
	<title>
		TradingView Chart | {summary.pair_symbol} ({swapFee}) token price on {summary.exchange_name}
	</title>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main class="ds-3">
	<PageHeader>
		<span slot="title">
			{summary.pair_symbol}
			<span class="swap-fee">{swapFee}</span>
		</span>
		<span slot="subtitle" class="subtitle">
			token pair on {summary.exchange_name} on
			<EntitySymbol size="0.875em" label={summary.chain_name} logoUrl={getLogoUrl('blockchain', summary.chain_slug)} />
		</span>
	</PageHeader>

	<Section padding="md" gap="xs">
		<h2>TradingView pair chart</h2>
		<p>Hello. Your new chart will go here!</p>
	</Section>
</main>

<style>
	.subtitle {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5ex;
	}

	.swap-fee {
		margin-left: var(--space-xxs);
		color: var(--c-text-extra-light);
	}
</style>
