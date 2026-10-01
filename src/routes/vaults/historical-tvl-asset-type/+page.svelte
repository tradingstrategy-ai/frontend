<!--
Historical TVL split between tokenised funds and all other vaults.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import { onMount } from 'svelte';
	import { fetchHistoricalTvl } from '$lib/echarts/fetch-historical-tvl';
	import Alert from '$lib/components/Alert.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import type { HistoricalTvlByAssetTypePayload } from '$lib/echarts/historical-tvl-asset-type';
	import { protocolPalette } from '$lib/scatter-plot/helpers';
	import ScatterPlotSelector from '$lib/scatter-plot/ScatterPlotSelector.svelte';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import HistoricalTvlGroupChart from '$lib/echarts/HistoricalTvlGroupChart.svelte';

	let chartData = $state<HistoricalTvlByAssetTypePayload | null>(null);
	let chartLoading = $state(true);
	let chartError = $state<string | null>(null);

	const title = 'Tokenised funds vs. vaults TVL';
	const description =
		'Compare historical TVL in tokenised funds and all other vaults, including their share of total TVL over time.';
	const chartDataVersion = 'usd-current-snapshot-v3';
	const assetTypeColours = [protocolPalette[0], protocolPalette[3]];
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	const compactUsd = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		notation: 'compact',
		maximumFractionDigits: 2
	});
	const exactUsd = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});
	const snapshotDate = $derived(
		chartData?.current
			? new Intl.DateTimeFormat('en-GB', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
					timeZone: 'UTC'
				}).format(new Date(chartData.current.asOf))
			: ''
	);

	onMount(() => {
		let cancelled = false;
		const controller = new AbortController();

		(async () => {
			try {
				chartLoading = true;
				chartError = null;

				const payload = await fetchHistoricalTvl<HistoricalTvlByAssetTypePayload>(
					resolve(`/vaults/historical-tvl-asset-type/chart-data?v=${chartDataVersion}`),
					controller.signal
				);
				if (!cancelled) chartData = payload;
			} catch (loadError) {
				if (cancelled) return;
				chartError = loadError instanceof Error ? loadError.message : 'Failed to load chart data.';
			} finally {
				if (!cancelled) chartLoading = false;
			}
		})();

		return () => {
			cancelled = true;
			controller.abort();
		};
	});
</script>

<MetaTags
	{title}
	{description}
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
			numberOfItems: chartData?.series.length ?? 0
		}
	}}
/>

<main class="historical-tvl-asset-type-page">
	<div class="mobile-notice">
		<Alert size="sm" status="warning">This chart is best viewed on a large screen.</Alert>
	</div>

	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner>
			{#snippet subtitle()}
				Compare historical <a href={resolve('/glossary/total-value-locked-tvl')}>TVL</a> in
				<a href={resolve('/vaults/funds')}>tokenised funds</a> and
				<a href={resolve('/glossary/vault')}>vaults</a> over time. Vaults include everything that is not a tokenised fund.
			{/snippet}
			{#snippet title()}
				<span>Tokenised funds vs. vaults TVL</span>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm" class="chart-section">
		{#if chartData?.current}
			<div class="current-tvl" data-testid="asset-type-current-tvl">
				<p class="snapshot-date">Latest reported TVL · {snapshotDate}</p>
				<div class="tvl-breakdown">
					{#each chartData.current.series as series, index (series.key)}
						<div class="tvl-stat" data-asset-type={series.key}>
							<span class="stat-label">
								<span class="stat-swatch" style={`background: ${assetTypeColours[index]}`} aria-hidden="true"></span>
								{series.label}
							</span>
							<strong title={exactUsd.format(series.tvl)}>{compactUsd.format(series.tvl)}</strong>
							<span class="stat-detail">
								{(chartData.current.totalTvl > 0 ? (series.tvl / chartData.current.totalTvl) * 100 : 0).toFixed(1)}% of
								total
							</span>
						</div>
					{/each}
					<div class="tvl-stat" data-asset-type="total">
						<span class="stat-label">Total TVL</span>
						<strong title={exactUsd.format(chartData.current.totalTvl)}
							>{compactUsd.format(chartData.current.totalTvl)}</strong
						>
						<span class="stat-detail">Tokenised funds + vaults</span>
					</div>
				</div>
			</div>
		{/if}
		<div class="chart-content">
			<HistoricalTvlGroupChart
				data={chartData}
				dataLoading={chartLoading}
				error={chartError}
				searchParamKey="types"
				selectorLabel="Asset type"
				selectorLabelPlural="asset types"
				watermarkCorner="top-left"
				showSeriesLines
				seriesColours={assetTypeColours}
				centreSelector
			/>
			<div class="history-note">
				<p>All-time shows completed weekly averages; 1y and 3m show daily observations.</p>
				<p>History reflects available observations, so newly tracked vaults can change the totals.</p>
			</div>
		</div>
		<div class="chart-navigation">
			<ScatterPlotSelector />
		</div>
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.current-tvl {
		margin-bottom: var(--space-xl);
	}

	.chart-content {
		display: grid;
		gap: var(--space-lg);
	}

	.history-note {
		display: grid;
		gap: var(--space-xs);
		max-width: 72ch;
		margin-inline: auto;
		font: var(--f-ui-xs-roman);
		color: var(--c-text-extra-light);
		text-align: center;
		line-height: 1.5;

		p {
			margin: 0;
		}
	}

	.chart-navigation {
		margin-top: var(--space-xl);
		border-top: 1px solid var(--c-box-3);
	}

	.snapshot-date {
		margin: 0 0 var(--space-md);
		font: var(--f-ui-sm-medium);
		color: var(--c-text-extra-light);
	}

	.tvl-breakdown {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-md);

		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}
	}

	.tvl-stat {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-lg);
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		background: var(--c-box-1);

		strong {
			font: var(--f-heading-lg-medium);
		}
	}

	.stat-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font: var(--f-ui-md-medium);
		color: var(--c-text-light);
	}

	.stat-swatch {
		width: 0.65rem;
		height: 0.65rem;
		border-radius: 50%;
	}

	.stat-detail {
		font: var(--f-ui-sm-medium);
		color: var(--c-text-extra-light);
	}

	.historical-tvl-asset-type-page {
		:global(.subtitle a) {
			text-decoration: underline;
		}
	}

	.mobile-notice {
		display: none;

		@media (max-width: 768px) {
			display: block;
			padding: 1rem var(--container-padding, 1rem);
		}
	}

	:global(.chart-section .standalone-historical-tvl-shell .chart-surface) {
		@media (--viewport-sm-down) {
			margin-inline: calc(-1 * var(--space-md));
			width: calc(100% + (2 * var(--space-md)));
		}
	}
</style>
