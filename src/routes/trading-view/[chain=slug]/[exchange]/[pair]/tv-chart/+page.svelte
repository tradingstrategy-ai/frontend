<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import Section from '$lib/components/Section.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import TvChart from '$lib/charts/TvChart.svelte';
	import Series from '$lib/charts/Series.svelte';
	import { CandlestickSeries } from 'lightweight-charts';
	import { CandleDataFeed } from '$lib/charts/candle-data-feed.svelte.js';
	import { OptionGroup } from '$lib/helpers/option-group.svelte.js';
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

	let timeBucket = new OptionGroup(CandleDataFeed.timeBuckets, '1d');

	const dataFeed = $derived(
		new CandleDataFeed(fetch, 'candles', timeBucket.selected, {
			candle_type: 'price',
			pair_id: summary.pair_id,
			exchange_type: summary.exchange_type
		})
	);
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
		<div class="chart-header">
			<h2>{summary.pair_symbol} TradingView chart</h2>
			<SegmentedControl name="timeBucket" options={timeBucket.options} bind:selected={timeBucket.selected} />
		</div>

		<TvChart>
			{#snippet children(chart)}
				<Series type={CandlestickSeries} {chart} {dataFeed} />
			{/snippet}
		</TvChart>
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

	.chart-header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;

		h2 {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--ls-heading-xl, normal);
		}
	}
</style>
