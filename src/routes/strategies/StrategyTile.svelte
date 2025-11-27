<script lang="ts">
	import type { StrategyInfo } from 'trade-executor/models/strategy-info';
	import { utcDay } from 'd3-time';
	import { resampleTimeSeries } from '$lib/charts/helpers';
	import { getChain } from '$lib/helpers/chain';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import TargetableLink from '$lib/components/TargetableLink.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import StrategyIcon from 'trade-executor/components/StrategyIcon.svelte';
	import StrategyError, { shouldDisplayError, adminOnlyError } from 'trade-executor/components/StrategyError.svelte';
	import ChartThumbnail from './ChartThumbnail.svelte';
	import StrategyDataSummary from './StrategyDataSummary.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';

	interface Props {
		admin?: boolean;
		simplified?: boolean;
		strategy: StrategyInfo;
		chartDateRange: [Date, Date];
	}

	let { admin = false, simplified = false, strategy, chartDateRange }: Props = $props();

	const chain = getChain(strategy.on_chain_data?.chain_id);

	const tags = strategy.tags?.filter((tag) => tag !== 'live') ?? [];
	const isLive = strategy.tags?.includes('live');

	const launchedAt = strategy.summary_statistics?.launched_at;
	const isNew = launchedAt ? utcDay.count(launchedAt, new Date()) < 90 : false;

	const href = `/strategies/${strategy.id}`;

	const rawChartData = strategy.useSharePrice
		? strategy.summary_statistics?.share_price_returns_90_days
		: strategy.summary_statistics?.compounding_unrealised_trading_profitability;

	const chartData = resampleTimeSeries(rawChartData ?? [], utcDay);
</script>

<div class="strategy-tile ds-3 targetable">
	<TargetableLink label="View strategy details" {href} />
	<div class="visuals" class:simplified>
		<div class="top">
			<div>
				{#if chain}
					<Tooltip>
						<img class="chain-icon" slot="trigger" src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
						<span slot="popup">
							This strategy runs on <strong>{chain.name}</strong> blockchain
						</span>
					</Tooltip>
				{/if}
			</div>

			<div class="badges">
				{#if !simplified && shouldDisplayError(strategy, admin)}
					<Tooltip>
						<DataBadge slot="trigger" status="error">Error</DataBadge>
						<svelte:fragment slot="popup">
							{#if adminOnlyError(strategy)}
								<div style:margin-bottom="1em">
									<Alert size="xs" status="info">This error is only displayed to admin users.</Alert>
								</div>
							{/if}
							<StrategyError {strategy} />
						</svelte:fragment>
					</Tooltip>
				{/if}

				{#if !simplified && admin && isLive}
					<DataBadge status="success">live</DataBadge>
				{/if}

				{#if isNew && !strategy.newVersionId}
					<DataBadge status="success">new</DataBadge>
				{/if}

				{#if !simplified}
					{#each tags as tag (tag)}
						<DataBadge status="warning">{tag}</DataBadge>
					{/each}
				{/if}

				{#if !simplified && strategy.newVersionId}
					<Tooltip>
						<DataBadge slot="trigger" status="error">Outdated</DataBadge>
						<svelte:fragment slot="popup">
							This is an outdated strategy. An updated version is available
							<a href="/strategies/{strategy.newVersionId}">here</a>.
						</svelte:fragment>
					</Tooltip>
				{/if}
			</div>
		</div>

		<a class="chart targetable-above" {href}>
			<ChartThumbnail data={chartData} dateRange={chartDateRange} />
		</a>
	</div>

	<div class="content">
		<header>
			<div class="avatar">
				<StrategyIcon {strategy} />
			</div>
			<div class="description">
				<h3 class="truncate">{strategy.name}</h3>
				<p class="truncate lines-3">{strategy.short_description ?? '---'}</p>
			</div>
		</header>
		<div class="data">
			<StrategyDataSummary {simplified} {strategy} />
		</div>
		<div class="actions">
			<Button size="md" class="targetable-above" {href}>
				{simplified ? 'Start trading' : 'View strategy'}
			</Button>
		</div>
	</div>
</div>

<style>
	.strategy-tile {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(90vw, 24rem), 1fr));
		grid-template-rows: auto 1fr;
		background: var(--c-box-1);
		border: 1px var(--c-box-3) solid;
		border-radius: var(--radius-lg);
		color: var(--c-text);
		transition: var(--transition-1);

		&:hover {
			background: var(--c-box-2);
			z-index: 2;
		}

		.visuals {
			position: relative;
			display: grid;
			grid-template-rows: auto 1fr;

			.top {
				display: flex;
				gap: 1rem;
				justify-content: space-between;
				padding: 1rem;
			}

			.chain-icon {
				display: flex;
				border-radius: 100%;
				height: 1.875rem;
				aspect-ratio: 1;
				padding: 15%;
				border: 1px solid var(--c-box-4);
				background: var(--c-box-2);
			}

			.badges {
				display: flex;
				gap: 0.375rem;
				font: var(--f-ui-sm-medium);

				:global([data-css-props]) {
					--data-badge-height: 100%;
				}

				:global(.tooltip .popup) {
					position: absolute;
					max-width: 22rem;
					right: 0;
					left: auto;
					bottom: auto;
				}
			}

			&.simplified .chart {
				margin-block: -2rem;

				:global(figcaption) {
					bottom: 1rem;
				}
			}
		}

		.content {
			container-type: inline-size;
			display: grid;
			grid-template-rows: auto 1fr auto;
			gap: 0.75rem;
			padding: 1.5rem;

			@media (--viewport-sm-down) {
				padding: 1rem;
			}

			header {
				--avatar-size: 6rem;
				--chain-icon-size: 1.5rem;
				display: grid;
				grid-template-columns: var(--avatar-size) auto;
				align-items: center;
				gap: 1.5rem;

				@container (width <= 400px) {
					--avatar-size: 4.75rem;
					--chain-icon-size: 1.25rem;
					gap: 1.25rem;
				}

				.avatar {
					position: relative;
					display: grid;
					height: var(--avatar-size);
					width: var(--avatar-size);
					border-radius: 100%;
					background: var(--c-box-3);
					font: var(--f-ui-sm-roman);
					text-align: center;

					:global(.tooltip .popup) {
						min-width: 20rem;
					}
				}

				.description {
					display: grid;
					gap: 0.25rem;

					> * {
						margin: 0;
					}
				}

				h3 {
					font: var(--f-ui-xxl-medium);
					letter-spacing: var(--ls-ui-xxl, normal);
					white-space: nowrap;

					@container (width <= 520px) {
						font: var(--f-ui-xl-medium);
						letter-spacing: var(--ls-ui-xl, normal);
					}

					@container (width <= 400px) {
						font: var(--f-ui-lg-medium);
						letter-spacing: var(--ls-ui-lg, normal);
					}
				}

				p {
					font: var(--f-ui-md-medium);
					letter-spacing: var(--ls-ui-md, normal);
					color: var(--c-text-extra-light);

					@container (width <= 400px) {
						font: var(--f-ui-sm-medium);
						letter-spacing: var(--ls-ui-sm, normal);
					}
				}
			}

			.data {
				position: relative;
			}

			.actions {
				display: grid;
			}
		}

		&:is(:hover, :focus) {
			.actions :global(.button) {
				background: var(--c-text);
				color: var(--c-text-inverted);
			}

			.chart :global(figcaption) {
				opacity: 1;
			}
		}
	}
</style>
