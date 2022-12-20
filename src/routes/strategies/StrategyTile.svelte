<script lang="ts">
	import type { StrategyRuntimeState, StrategySummaryStatistics } from 'trade-executor-frontend/strategy/runtimeState';
	import { Button, ChartPlaceholder } from '$lib/components';
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';

	export let strategy: StrategyRuntimeState;

	const hasError = !!strategy.error;
	const summaryStats = strategy.summary_statistics || {};

	function getPerformanceClass({ enough_data, profitability_90_days }: StrategySummaryStatistics) {
		return determinePriceChangeClass(enough_data ? profitability_90_days : 0);
	}
</script>

<li class:hasError>
	<div class="thumbnail">
		<ChartPlaceholder />
	</div>
	<div class="info">
		<div class="details">
			<h2 class="title">{strategy.name}</h2>
			<dl>
				<div>
					<dt>Historic performance</dt>
					<dd class={getPerformanceClass(summaryStats)}>
						{#if summaryStats.enough_data}
							{formatPriceChange(summaryStats.profitability_90_days)}
						{:else}
							---
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
		<Button label="View strategy details" href="/strategies/{strategy.id}" tertiary lg disabled={hasError} />
	</div>
</li>

<style lang="postcss">
	li {
		display: grid;
		background: var(--c-background-5);
		border-radius: var(--strategy-tile-border-radius, var(--border-radius-md));
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		grid-template-rows: auto;
		grid-auto-rows: 1fr;
		list-style: none;
		overflow: hidden;
	}

	.thumbnail {
		align-items: center;
		display: flex;
		justify-content: center;
		overflow: hidden;

		& :global .chart-placeholder {
			object-fit: cover;
			width: 100%;
			height: min(32rem, 100%);
		}
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
		white-space: nowrap;
	}

	dd {
		font: var(--f-ui-xl-medium);
		letter-spacing: var(--f-ui-xl-spacing, normal);
		margin: 0;

		@nest .hasError & {
			color: var(--c-text-ultra-light);
		}
	}

	.description {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
	}
</style>
