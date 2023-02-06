<script lang="ts">
	import { fromUnixTime } from 'date-fns';
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import { Button, Icon } from '$lib/components';
	import ChartThumbnail from './ChartThumbnail.svelte';
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';

	export let strategy: StrategyRuntimeState;
	export let chartStartDate: Date | undefined = undefined;

	const hasError = !!strategy.error;
	const summaryStats = strategy.summary_statistics || {};
	const chartData = summaryStats.performance_chart_90_days?.map(([ts, val]) => [fromUnixTime(ts), val]);
</script>

<li class="strategy tile tile b" class:hasError>
	<ChartThumbnail data={chartData} startDate={chartStartDate} />
	<div class="info">
		<div class="details">
			<h2 class="title">{strategy.name}</h2>
			<dl>
				<div>
					<dt title="90 day return (annualized)">Historic performance</dt>
					<dd class={determinePriceChangeClass(summaryStats.profitability_90_days)}>
						{formatPriceChange(summaryStats.profitability_90_days)}
						{#if summaryStats.profitability_90_days && !summaryStats.enough_data}
							<span class="insufficient-data" title="This strategy has less than 90 days of performance data">
								<Icon name="warning" />
							</span>
						{/if}
					</dd>
				</div>
				<div>
					<dt>Amount of assets</dt>
					<dd>
						{formatDollar(summaryStats.current_value)}
					</dd>
				</div>
			</dl>
			<div class="description">
				{#if !hasError}
					<p>{strategy.short_description}</p>
				{:else}
					<p>Strategy data not currently available.</p>
				{/if}
			</div>
		</div>
		<Button label="View strategy details" href="/strategies/{strategy.id}" tertiary size="lg" disabled={hasError} />
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
		font: var(--f-ui-xxl-medium);
		letter-spacing: var(--f-ui-xxl-spacing, normal);
	}

	dl {
		display: grid;
		grid-template-columns: auto auto;
		gap: var(--space-ss);
		margin: 0;

		& > div {
			display: grid;
			gap: var(--space-ss);
		}
	}

	dt {
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing, normal);
	}

	dd {
		font: var(--f-ui-xl-medium);
		letter-spacing: var(--f-ui-xl-spacing, normal);
		margin: 0;
		display: flex;
		gap: var(--space-ss);

		@nest .hasError & {
			color: var(--c-text-ultra-light);
		}
	}

	.insufficient-data {
		font-size: 18px;
	}

	.description {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}
</style>
