<script lang="ts">
	import { fromUnixTime } from 'date-fns';
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import { AlertItem, AlertList, Button } from '$lib/components';
	import ChartThumbnail from './ChartThumbnail.svelte';
	import KeyMetric from './KeyMetric.svelte';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import {
		formatDollar,
		formatDaysAgo,
		formatKeyMetricNumber,
		formatPercent,
		formatPriceChange
	} from '$lib/helpers/formatters';

	import { getTradeExecutorErrorHtml } from 'trade-executor-frontend/strategy/error';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let strategy: StrategyRuntimeState;
	export let chartStartDate: Date | undefined = undefined;

	const summaryStats = strategy.summary_statistics || {};
	const chartData = summaryStats.performance_chart_90_days?.map(([ts, val]) => [fromUnixTime(ts), val]);

	// Get the error message HTML
	$: errorHtml = getTradeExecutorErrorHtml(strategy);
	$: backtestLink = `/strategies/${strategy.id}/backtest`;
</script>

<li class="strategy tile tile b">
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
				<KeyMetric name="Profitability" metric={summaryStats?.key_metrics?.profitability} {backtestLink} let:value>
					<span class={determinePriceChangeClass(value)}>{formatPriceChange(value)}</span>
				</KeyMetric>

				<KeyMetric
					name="Total assets"
					metric={summaryStats?.key_metrics?.total_equity}
					formatter={formatDollar}
					{backtestLink}
				/>
			</dl>

			<dl>
				<KeyMetric name="Age" metric={summaryStats?.key_metrics?.started_at} formatter={formatDaysAgo} {backtestLink} />

				<KeyMetric
					name="Maximum drawdown"
					metric={summaryStats?.key_metrics?.max_drawdown}
					formatter={formatPercent}
					{backtestLink}
				/>
			</dl>

			<dl>
				<KeyMetric
					name="Sharpe"
					metric={summaryStats?.key_metrics?.sharpe}
					formatter={formatKeyMetricNumber}
					{backtestLink}
				/>

				<KeyMetric
					name="Sortino"
					metric={summaryStats?.key_metrics?.sortino}
					formatter={formatKeyMetricNumber}
					{backtestLink}
				/>
			</dl>

			<!-- TODO: make part of strategy configuration -->
			<div class="logos">
				<img alt="This strategy uses Enzyme vault" src={getLogoUrl('tokens', 'enzyme')} />
				<img alt="This strategy runs on Polygon blockchain" src={getLogoUrl('tokens', 'matic')} />
				<img alt="This strategy trades ETH" src={getLogoUrl('tokens', 'eth')} />
				<img alt="This strategy trades USDC" src={getLogoUrl('tokens', 'usdc')} />
			</div>
		</div>

		{#if errorHtml}
			<AlertList status="warning" size="xs">
				<AlertItem title="Ongoing execution issues">
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
		grid-template-columns: 1fr 1fr;
		gap: var(--space-ss);
		margin: 0;
	}

	.description {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}

	.logos img {
		width: 32px;
		height: 32px;
	}
</style>
