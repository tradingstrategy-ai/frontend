<script lang="ts">
	import type { StrategyMetadata } from 'trade-executor-frontend/strategy/metadata';
	import { Button, ChartPlaceholder } from '$lib/components';
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';

	export let strategy: StrategyMetadata;

	const hasError = !!strategy.error;

	// TODO: verify/update performance_90_day field name (here and below)
	const performanceClass = determinePriceChangeClass(strategy.performance_90_day);
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
					<dt>Historic Performance</dt>
					<!-- TODO: verify/update field name below -->
					<dd class={performanceClass}>{formatPriceChange(strategy.performance_90_day)}</dd>
				</div>
				<div>
					<dt>Amount of assets</dt>
					<dd>
						<!-- TODO: verify/update field names below -->
						{formatDollar(strategy.open_position_equity, 1, 1)}
						/
						{formatDollar(strategy.total_equity, 0, 1)}
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
		<Button label="View strategy details" href="/strategy/{strategy.id}" tertiary lg disabled={hasError} />
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
		gap: var(--strategy-tile-info-gap, 1.5rem);
		padding: 1.5rem;
	}

	.details {
		display: grid;
		gap: var(--strategy-tile-details-gap, 1rem);
		align-content: start;
	}

	.title {
		font: var(--f-ui-xxl-medium);
		letter-spacing: var(--f-ui-xxl-spacing);
	}

	dl {
		display: grid;
		grid-template-columns: auto auto;
		gap: 0.5rem;
		margin: 0;

		& > div {
			display: grid;
			gap: 0.5rem;
		}
	}

	dt {
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing);
		white-space: nowrap;
	}

	dd {
		font: var(--f-ui-xl-medium);
		letter-spacing: var(--f-ui-xl-spacing);
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
