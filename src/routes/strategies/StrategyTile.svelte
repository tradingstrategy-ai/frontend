<script lang="ts">
	import { fromUnixTime } from 'date-fns';
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import { AlertItem, AlertList, Button } from '$lib/components';
	import ChartThumbnail from './ChartThumbnail.svelte';
	import KeyMetric from './KeyMetric.svelte';
	import { formatDollar, formatDurationDays, formatKeyMetricNumber, formatPercent } from '$lib/helpers/formatters';

	import { getTradeExecutorErrorHtml } from 'trade-executor-frontend/strategy/error';

	export let strategy: StrategyRuntimeState;
	export let chartStartDate: Date | undefined = undefined;

	const hasError = !!strategy.error;
	const summaryStats = strategy.summary_statistics || {};
	const chartData = summaryStats.performance_chart_90_days?.map(([ts, val]) => [fromUnixTime(ts), val]);

	// Get the error message HTML
	$: errorHtml = getTradeExecutorErrorHtml(strategy);
</script>

<li class="strategy tile tile b" class:hasError>
	<ChartThumbnail data={chartData} startDate={chartStartDate} />
	<div class="info">
		<div class="details">
			<h2 class="title">{strategy.name}</h2>

			<div class="description">
				{#if strategy.short_description}
					<p>{strategy.short_description}</p>
				{/if}
			</div>

			<dl>
				<KeyMetric
					name="Performance"
					metric={summaryStats?.key_metrics?.profitability}
					formatter={formatPercent}
					colouredPercent
				/>

				<KeyMetric name="Total assets" metric={summaryStats?.key_metrics?.total_equity} formatter={formatDollar} />
			</dl>

			<dl>
				<KeyMetric name="Age" metric={summaryStats?.key_metrics?.started_at} formatter={formatDurationDays} />

				<KeyMetric name="Max drawdown" metric={summaryStats?.key_metrics?.max_drawdown} formatter={formatPercent} />
			</dl>

			<dl>
				<KeyMetric name="Sharpe" metric={summaryStats?.key_metrics?.sharpe} formatter={formatKeyMetricNumber} />

				<KeyMetric name="Sortino" metric={summaryStats?.key_metrics?.sortino} formatter={formatKeyMetricNumber} />
			</dl>
		</div>

		{#if errorHtml}
			<AlertList status="warning" size="xs">
				<AlertItem title="On-going execution issues">
					{@html errorHtml}
				</AlertItem>
			</AlertList>
		{/if}

		<Button label="View strategy" href="/strategies/{strategy.id}" tertiary size="lg" disabled={!strategy.connected} />
	</div>
</li>

<style lang="postcss">
	li {
		display: grid;
		border-radius: var(--strategy-tile-border-radius, var(--radius-md));
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		grid-template-rows: auto;
		grid-auto-rows: 1fr;
		list-style: none;
		overflow: hidden;
	}

	.info {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: var(--strategy-tile-info-gap, var(--space-lg));
		padding: var(--space-lg);
	}

	.details {
		display: grid;
		gap: var(--strategy-tile-details-gap, var(--space-md));
		align-content: start;
	}

	.title {
		font: var(--f-ui-large-medium);
		letter-spacing: var(--f-ui-xxl-spacing, normal);
	}

	dl {
		display: grid;
		grid-template-columns: 50% 50%;
		gap: var(--space-ss);
		margin: 0;

		& > div {
			display: grid;
			gap: var(--space-ss);
		}
	}

	.description {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}
</style>
